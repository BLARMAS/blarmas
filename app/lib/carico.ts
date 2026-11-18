import { aggiungiGiorni, lunediDi } from "./date";
import { ORE_PER_GIORNO, oreRestantiAttivita, type Attivita, type Membro } from "./tipi";

// Calcoli per la pagina "Carico di lavoro": quanto è impegnata ogni persona.
// Il carico si misura confrontando le ore RESTANTI delle attività aperte con la capacità del periodo
// (8 ore per ogni giorno lavorativo, da lunedì a venerdì, a partire da oggi).

export type Periodo = "settimana" | "mese" | "quattro-settimane";

export const periodi: { id: Periodo; nome: string }[] = [
  { id: "settimana", nome: "Questa settimana" },
  { id: "mese", nome: "Questo mese" },
  { id: "quattro-settimane", nome: "Prossime 4 settimane" },
];

// L'ultimo giorno del periodo (il primo è sempre oggi)
export function fineDelPeriodo(periodo: Periodo, oggi: string) {
  if (periodo === "settimana") return aggiungiGiorni(lunediDi(oggi), 6); // la domenica
  if (periodo === "mese") {
    const anno = Number(oggi.slice(0, 4));
    const mese = Number(oggi.slice(5, 7)); // 1-12: come mese successivo in base 0
    return new Date(Date.UTC(anno, mese, 0)).toISOString().slice(0, 10); // giorno 0 del mese dopo = ultimo di questo
  }
  return aggiungiGiorni(oggi, 27);
}

// Quanti giorni da lunedì a venerdì ci sono tra due date (estremi compresi)
export function giorniLavorativi(da: string, a: string) {
  let totale = 0;
  for (let giorno = da; giorno <= a; giorno = aggiungiGiorni(giorno, 1)) {
    const settimana = new Date(`${giorno}T12:00:00Z`).getUTCDay(); // 0 = domenica
    if (settimana >= 1 && settimana <= 5) totale++;
  }
  return totale;
}

export type RigaCarico = {
  membro: Membro;
  aperte: Attivita[]; // tutte le attività non concluse assegnate alla persona
  inPeriodo: Attivita[]; // quelle che scadono entro la fine del periodo (comprese le già scadute)
  orePianificate: number; // ore assegnate alle attività del periodo
  oreConsumate: number;
  oreRestanti: number;
  inRitardo: number; // attività aperte con scadenza già passata
  senzaOre: number; // attività aperte senza ore indicate: non si possono contare
  senzaScadenza: number; // attività aperte senza scadenza: non rientrano in nessun periodo
  capacita: number; // ore disponibili nel periodo
  percentuale: number | null; // carico in % (null se nel periodo non ci sono giorni lavorativi)
};

export function calcolaCarico(membri: Membro[], attivita: Attivita[], oggi: string, periodo: Periodo): RigaCarico[] {
  const fine = fineDelPeriodo(periodo, oggi);
  const capacita = giorniLavorativi(oggi, fine) * ORE_PER_GIORNO;

  return membri
    .map((membro) => {
      const aperte = attivita.filter((a) => a.assegnatarioId === membro.id && a.stato !== "Fatto");
      const inPeriodo = aperte.filter((a) => a.scadenza !== null && a.scadenza <= fine);
      const oreRestanti = inPeriodo.reduce((somma, a) => somma + (oreRestantiAttivita(a) ?? 0), 0);
      return {
        membro,
        aperte,
        inPeriodo,
        orePianificate: inPeriodo.reduce((somma, a) => somma + (a.ore ?? 0), 0),
        oreConsumate: inPeriodo.reduce((somma, a) => somma + a.oreConsumate, 0),
        oreRestanti,
        inRitardo: aperte.filter((a) => a.scadenza !== null && a.scadenza < oggi).length,
        senzaOre: aperte.filter((a) => a.ore === null).length,
        senzaScadenza: aperte.filter((a) => a.scadenza === null).length,
        capacita,
        percentuale: capacita > 0 ? (oreRestanti / capacita) * 100 : null,
      };
    })
    // Si mostrano le persone attive e chi ha attività aperte (anche se sospeso o invitato)
    .filter((r) => r.membro.stato === "attivo" || r.aperte.length > 0)
    .sort((a, b) => b.oreRestanti - a.oreRestanti);
}

// ---------- Calendario del carico: quante ore al giorno ha ogni persona ----------

// I giorni da lunedì a venerdì tra due date (estremi compresi), come elenco di date
export function elencoGiorniLavorativi(da: string, a: string) {
  const giorni: string[] = [];
  for (let giorno = da; giorno <= a; giorno = aggiungiGiorni(giorno, 1)) {
    const settimana = new Date(`${giorno}T12:00:00Z`).getUTCDay();
    if (settimana >= 1 && settimana <= 5) giorni.push(giorno);
  }
  return giorni;
}

// Il primo giorno lavorativo uguale o successivo a quello indicato
function primoGiornoLavorativo(da: string) {
  let giorno = da;
  while (new Date(`${giorno}T12:00:00Z`).getUTCDay() % 6 === 0) giorno = aggiungiGiorni(giorno, 1); // 0 = dom, 6 = sab
  return giorno;
}

export type Contributo = { attivita: Attivita; ore: number };

export type RigaGiornaliera = {
  membro: Membro;
  ore: Record<string, number>; // ore previste per ogni giorno visibile
  contributi: Record<string, Contributo[]>; // da quali attività arrivano
  senzaPianificazione: Attivita[]; // attività aperte che non si possono mettere in calendario (senza ore o senza scadenza)
};

// Distribuisce le ore RESTANTI di ogni attività aperta, in parti uguali, sui giorni lavorativi tra l'inizio e la scadenza.
//  - Senza data di inizio (o con inizio già passato) si parte da oggi.
//  - Se la scadenza è già passata, tutte le ore finiscono su oggi (o sul primo giorno lavorativo utile).
//  - Se tra inizio e scadenza non c'è nessun giorno lavorativo, si usa il primo giorno lavorativo dopo l'inizio.
//  - Senza scadenza o senza ore l'attività non si può mettere in calendario.
export function calcolaGiornaliero(membri: Membro[], attivita: Attivita[], oggi: string, fine: string) {
  const giorni = elencoGiorniLavorativi(oggi, fine);
  const visibili = new Set(giorni);

  const righe: RigaGiornaliera[] = membri
    .map((membro) => {
      const aperte = attivita.filter((a) => a.assegnatarioId === membro.id && a.stato !== "Fatto");
      const ore: Record<string, number> = {};
      const contributi: Record<string, Contributo[]> = {};
      const senzaPianificazione: Attivita[] = [];

      for (const a of aperte) {
        const restanti = oreRestantiAttivita(a);
        if (restanti === null || a.scadenza === null) {
          senzaPianificazione.push(a);
          continue;
        }
        if (restanti <= 0) continue;
        const da = a.inizio && a.inizio > oggi ? a.inizio : oggi;
        const a_ = a.scadenza < oggi ? oggi : a.scadenza < da ? da : a.scadenza;
        let giorniAttivita = elencoGiorniLavorativi(da, a_);
        if (giorniAttivita.length === 0) giorniAttivita = [primoGiornoLavorativo(da)];
        const quota = restanti / giorniAttivita.length;
        for (const giorno of giorniAttivita) {
          if (!visibili.has(giorno)) continue; // fuori dal periodo mostrato
          ore[giorno] = (ore[giorno] ?? 0) + quota;
          (contributi[giorno] ??= []).push({ attivita: a, ore: quota });
        }
      }
      return { membro, ore, contributi, senzaPianificazione, haAperte: aperte.length > 0 };
    })
    .filter((r) => r.membro.stato === "attivo" || r.haAperte)
    .map((r) => ({ membro: r.membro, ore: r.ore, contributi: r.contributi, senzaPianificazione: r.senzaPianificazione }));

  return { giorni, righe };
}
