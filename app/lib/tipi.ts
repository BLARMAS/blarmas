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
  scadenza: string | null; // "2026-12-01"
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
  scadenza: string | null;
  etichette: string[];
  assegnatarioId: string | null;
  assegnatario: string; // nome da mostrare ("Nessuno" se non assegnata)
};

export type Membro = {
  id: string;
  nome: string | null; // vuoto finché l'invitato non si registra
  email: string;
  ruolo: Ruolo;
  stato: "attivo" | "invitato";
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
  progetti: { id: string; nome: string }[]; // per i menu a tendina
};

export const nomeMembro = (m: Pick<Membro, "nome" | "email">) => m.nome || m.email;
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
