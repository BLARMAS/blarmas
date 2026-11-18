// I tipi di dati usati nel sito: descrivono com'è fatta una riga del database.

export type StatoProgetto = "In corso" | "A rischio" | "Completato";
export type Stato = "Da fare" | "In corso" | "Fatto";
export type Priorita = "Alta" | "Media" | "Bassa";
export type Ruolo = "admin" | "membro" | "ospite";

export const stati: Stato[] = ["Da fare", "In corso", "Fatto"];
export const prioritaPossibili: Priorita[] = ["Alta", "Media", "Bassa"];

export type Progetto = {
  id: string;
  nome: string;
  stato: StatoProgetto; // calcolato dalle attività
  inizio: string | null; // "2026-11-03" (facoltativa)
  scadenza: string | null; // "2026-12-01"
  ore: number | null; // effort del progetto, in ore (facoltativo)
  orePianificate: number; // somma delle ore assegnate a tutte le attività del progetto
  oreConsumate: number; // ore già usate dalle attività (vedi db.ts per come si contano)
  oreRestanti: number | null; // ore del progetto meno quelle consumate (mai sotto zero)
  creato: string; // "2026-11-10"
  avanzamento: number; // percentuale di attività fatte
  totaleAttivita: number;
};

export type Attivita = {
  id: string;
  progettoId: string;
  progettoNome: string;
  titolo: string;
  descrizione: string;
  stato: Stato;
  priorita: Priorita;
  inizio: string | null;
  scadenza: string | null;
  etichette: string[];
  ore: number | null; // effort dell'attività, in ore (facoltativo)
  oreConsumate: number; // ore già consumate su questa attività (0 se nessuna)
  assegnatarioId: string | null;
  assegnatario: string; // nome da mostrare ("Nessuno" se non assegnata)
};

export type StatoMembro = "attivo" | "invitato" | "sospeso";

export type Membro = {
  id: string;
  nome: string | null; // vuoto finché l'invitato non si registra
  email: string | null; // vuota solo per il segnaposto
  ruolo: Ruolo;
  stato: StatoMembro;
  segnaposto: boolean; // persona di default "Da assegnare": senza email né account, non si elimina
  registrato: boolean; // ha già un account (si è registrata)
};

export type Promemoria = {
  id: string;
  testo: string;
  scadenza: string | null;
  fatto: boolean;
};

// Chi è collegato e in quale organizzazione sta lavorando
export type Sessione = {
  utenteId: string;
  email: string;
  membroId: string;
  nome: string; // nome da mostrare (se manca, l'email)
  ruolo: Ruolo;
  organizzazioneId: string;
  organizzazioneNome: string;
  organizzazioni: { id: string; nome: string }[]; // tutte quelle di cui fa parte
  membri: Membro[]; // le persone dell'organizzazione
  progetti: { id: string; nome: string; ore: number | null; orePianificate: number }[]; // per i menu a tendina e per avvisare se si superano le ore
};

export const nomeMembro = (m: Pick<Membro, "nome" | "email">) => m.nome || m.email || "Senza nome";
export const etichettaRuolo: Record<Ruolo, string> = { admin: "Admin", membro: "Membro", ospite: "Ospite" };

// "Mario Rossi" -> "MR"; se manca il nome si usa l'email
export function iniziali(testo: string) {
  const parti = testo.split(/[\s@.]+/).filter(Boolean);
  return ((parti[0]?.[0] ?? "?") + (parti.length > 1 ? parti[1][0] : "")).toUpperCase();
}

// "Mario Rossi" -> "Mario"; se c'è solo l'email, la parte prima della chiocciola
export const primoNome = (testo: string) => testo.split(/[\s@]/)[0];

// Una voce del calendario: ogni attività con scadenza è un evento
export type Evento = { id: string; data: string; titolo: string; fatto: boolean };

export function comeEventi(attivita: Attivita[]): Evento[] {
  return attivita
    .filter((a) => a.scadenza)
    .map((a) => ({ id: a.id, data: a.scadenza as string, titolo: a.titolo, fatto: a.stato === "Fatto" }));
}

// Un giorno lavorativo = 8 ore. L'effort si salva sempre in ore; i giorni si ricavano.
export const ORE_PER_GIORNO = 8;
export const giorniInOre = (giorni: number) => giorni * ORE_PER_GIORNO;
export const oreInGiorni = (ore: number) => ore / ORE_PER_GIORNO;

// 2.5 -> "2,5"; 12 -> "12" (formato italiano, al massimo 2 decimali)
export const formattaNumero = (n: number) => n.toLocaleString("it-IT", { maximumFractionDigits: 2 });
// 96 -> "96 h"
export const formattaOre = (ore: number) => `${formattaNumero(ore)} h`;
// 96 -> "12 gg (96 h)"
export const formattaEffort = (ore: number) => `${formattaNumero(oreInGiorni(ore))} gg (${formattaOre(ore)})`;

// Ore che restano su un'attività: assegnate meno consumate. Se è conclusa non resta niente; senza ore assegnate non si sa.
export function oreRestantiAttivita(a: Pick<Attivita, "ore" | "oreConsumate" | "stato">): number | null {
  if (a.ore === null) return null;
  return a.stato === "Fatto" ? 0 : Math.max(0, a.ore - a.oreConsumate);
}
