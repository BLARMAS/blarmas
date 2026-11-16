// Funzioni per le date. Le date sono scritte come testo "2026-11-18".

// La data di oggi in Italia, come "2026-11-18".
// Va chiamata sul server (nelle pagine) e passata ai componenti che ne hanno bisogno.
export function oggiIso() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
}

// "2026-11-18" + 7 giorni = "2026-11-25"
export function aggiungiGiorni(iso: string, giorni: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + giorni);
  return d.toISOString().slice(0, 10);
}

// Quanti giorni passano da "da" ad "a" (negativo se "a" viene prima)
export function giorniTra(da: string, a: string) {
  return Math.round((Date.parse(`${a}T12:00:00Z`) - Date.parse(`${da}T12:00:00Z`)) / 86_400_000);
}

export const NOMI_MESI = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

function inData(iso: string) {
  return new Date(`${iso}T12:00:00Z`);
}

// "18 nov" oppure "18 novembre"
export function formattaData(iso: string | null, formato: "breve" | "lunga" = "breve") {
  if (!iso) return "senza scadenza";
  return inData(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: formato === "lunga" ? "long" : "short",
    timeZone: "UTC",
  });
}

// "mar 17 nov"
export function formattaGiorno(iso: string) {
  return inData(iso).toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export type Cella = { iso: string; giorno: number; fuori: boolean };

// Le celle di un mese, divise in settimane (si parte da lunedì).
// "fuori" = giorno del mese precedente o successivo, che completa la settimana.
export function celleMese(anno: number, mese: number): Cella[][] {
  const primo = new Date(Date.UTC(anno, mese, 1));
  const spostamento = (primo.getUTCDay() + 6) % 7;
  const giorniMese = new Date(Date.UTC(anno, mese + 1, 0)).getUTCDate();
  const totale = Math.ceil((spostamento + giorniMese) / 7) * 7;

  const celle: Cella[] = [];
  for (let i = 0; i < totale; i++) {
    const d = new Date(Date.UTC(anno, mese, 1 - spostamento + i));
    celle.push({
      iso: d.toISOString().slice(0, 10),
      giorno: d.getUTCDate(),
      fuori: d.getUTCMonth() !== mese,
    });
  }

  const settimane: Cella[][] = [];
  for (let i = 0; i < celle.length; i += 7) settimane.push(celle.slice(i, i + 7));
  return settimane;
}

// Il lunedì della settimana in cui cade la data (le settimane partono da lunedì)
export function lunediDi(iso: string) {
  const giorno = (inData(iso).getUTCDay() + 6) % 7; // lunedì = 0
  return aggiungiGiorni(iso, -giorno);
}
