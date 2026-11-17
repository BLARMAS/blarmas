import { cache } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { creaClientServer } from "./supabase/server";
import type { Attivita, Membro, Progetto, Promemoria, Sessione, StatoProgetto } from "./tipi";
import { nomeMembro } from "./tipi";

// Funzioni che LEGGONO i dati dal database, per le pagine sul server.
// Le regole di sicurezza (RLS) fanno vedere solo i dati della propria organizzazione:
// il filtro sull'organizzazione serve a scegliere quale, se la persona ne ha più d'una.

// Chi è collegato, in quale organizzazione lavora, e le sue persone e progetti.
// "cache" evita di rifare le stesse domande al database più volte nella stessa visita.
export const caricaSessione = cache(async (): Promise<Sessione | null> => {
  // Dice a Next che la pagina cambia a ogni visita (dipende da chi è collegato e dalla data di oggi)
  await connection();
  const supabase = await creaClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: mie, error: erroreMembri } = await supabase
    .from("membri")
    .select("id, nome, email, ruolo, organizzazione_id, organizzazioni(id, nome)")
    .eq("utente_id", user.id)
    .eq("stato", "attivo")
    .order("creato_il");
  if (erroreMembri) console.error("Lettura delle organizzazioni non riuscita:", erroreMembri.message);
  if (!mie || mie.length === 0) return null;

  type Mia = { id: string; nome: string | null; email: string; ruolo: Sessione["ruolo"]; organizzazione_id: string; organizzazioni: { id: string; nome: string } };
  const lista = mie as unknown as Mia[];

  // L'organizzazione scelta dal selettore in alto (cookie "org"); se manca, la prima
  const scelta = (await cookies()).get("org")?.value;
  const corrente = lista.find((m) => m.organizzazione_id === scelta) ?? lista[0];
  const orgId = corrente.organizzazione_id;

  const [{ data: membri }, { data: progetti }] = await Promise.all([
    supabase
      .from("membri")
      .select("id, nome, email, ruolo, stato, segnaposto, utente_id")
      .eq("organizzazione_id", orgId)
      .order("creato_il"),
    supabase.from("progetti").select("id, nome, ore, attivita(ore)").eq("organizzazione_id", orgId).order("creato_il"),
  ]);

  return {
    utenteId: user.id,
    email: corrente.email,
    membroId: corrente.id,
    nome: nomeMembro(corrente),
    ruolo: corrente.ruolo,
    organizzazioneId: orgId,
    organizzazioneNome: corrente.organizzazioni.nome,
    organizzazioni: lista.map((m) => ({ id: m.organizzazione_id, nome: m.organizzazioni.nome })),
    // Dell'id dell'account si tiene solo "esiste o no": al browser non serve altro
    membri: ((membri ?? []) as (Omit<Membro, "registrato"> & { utente_id: string | null })[]).map(
      ({ utente_id, ...m }) => ({ ...m, registrato: utente_id !== null }),
    ),
    progetti: ((progetti ?? []) as { id: string; nome: string; ore: number | null; attivita: { ore: number | null }[] }[]).map(
      ({ attivita, ...p }) => ({ ...p, orePianificate: attivita.reduce((somma, a) => somma + (a.ore ?? 0), 0) }),
    ),
  };
});

type RigaProgetto = {
  id: string;
  nome: string;
  scadenza: string | null;
  ore: number | null;
  creato_il: string;
  attivita: { stato: string; scadenza: string | null; ore: number | null; ore_consumate: number }[];
};

// Lo stato del progetto si calcola dalle sue attività:
// Completato = sono tutte fatte; A rischio = ce n'è qualcuna scaduta e non fatta; altrimenti In corso
function calcolaStato(attivita: RigaProgetto["attivita"], oggi: string): StatoProgetto {
  if (attivita.length > 0 && attivita.every((a) => a.stato === "Fatto")) return "Completato";
  if (attivita.some((a) => a.stato !== "Fatto" && a.scadenza && a.scadenza < oggi)) return "A rischio";
  return "In corso";
}

export async function caricaProgetti(organizzazioneId: string, oggi: string): Promise<Progetto[]> {
  const supabase = await creaClientServer();
  const { data } = await supabase
    .from("progetti")
    .select("id, nome, scadenza, ore, creato_il, attivita(stato, scadenza, ore, ore_consumate)")
    .eq("organizzazione_id", organizzazioneId)
    .order("creato_il");

  return ((data ?? []) as RigaProgetto[]).map((p) => {
    const fatte = p.attivita.filter((a) => a.stato === "Fatto").length;
    // Ore usate dal progetto = somma delle ore usate da ogni attività.
    // Un'attività conclusa ("Fatto") conta almeno tutte le sue ore assegnate; se ne ha consumate di più, contano quelle.
    // Un'attività non conclusa conta le ore che ha già consumato.
    const orePianificate = p.attivita.reduce((somma, a) => somma + (a.ore ?? 0), 0);
    const oreConsumate = p.attivita.reduce(
      (somma, a) => somma + (a.stato === "Fatto" ? Math.max(a.ore ?? 0, a.ore_consumate) : a.ore_consumate),
      0,
    );
    return {
      id: p.id,
      nome: p.nome,
      scadenza: p.scadenza,
      ore: p.ore,
      orePianificate,
      oreConsumate,
      oreRestanti: p.ore === null ? null : Math.max(0, p.ore - oreConsumate),
      creato: p.creato_il.slice(0, 10),
      stato: calcolaStato(p.attivita, oggi),
      avanzamento: p.attivita.length ? Math.round((fatte / p.attivita.length) * 100) : 0,
      totaleAttivita: p.attivita.length,
    };
  });
}

type RigaAttivita = {
  id: string;
  progetto_id: string;
  titolo: string;
  descrizione: string;
  stato: Attivita["stato"];
  priorita: Attivita["priorita"];
  scadenza: string | null;
  etichette: string[];
  ore: number | null;
  ore_consumate: number;
  assegnatario_id: string | null;
};

// Le attività dell'organizzazione (di un solo progetto, se si indica progettoId)
export async function caricaAttivita(sessione: Sessione, progettoId?: string): Promise<Attivita[]> {
  const supabase = await creaClientServer();
  let domanda = supabase
    .from("attivita")
    .select("id, progetto_id, titolo, descrizione, stato, priorita, scadenza, etichette, ore, ore_consumate, assegnatario_id")
    .eq("organizzazione_id", sessione.organizzazioneId)
    .order("creata_il");
  if (progettoId) domanda = domanda.eq("progetto_id", progettoId);
  const { data } = await domanda;

  return ((data ?? []) as RigaAttivita[]).map((a) => {
    const persona = sessione.membri.find((m) => m.id === a.assegnatario_id);
    return {
      id: a.id,
      progettoId: a.progetto_id,
      progettoNome: sessione.progetti.find((p) => p.id === a.progetto_id)?.nome ?? "",
      titolo: a.titolo,
      descrizione: a.descrizione,
      stato: a.stato,
      priorita: a.priorita,
      scadenza: a.scadenza,
      etichette: a.etichette,
      ore: a.ore,
      oreConsumate: a.ore_consumate,
      assegnatarioId: a.assegnatario_id,
      assegnatario: persona ? nomeMembro(persona) : "Nessuno",
    };
  });
}

// I promemoria personali di chi è collegato
export async function caricaPromemoria(sessione: Sessione): Promise<Promemoria[]> {
  const supabase = await creaClientServer();
  const { data } = await supabase
    .from("promemoria")
    .select("id, testo, scadenza, fatto")
    .eq("organizzazione_id", sessione.organizzazioneId)
    .eq("utente_id", sessione.utenteId)
    .order("creato_il");
  return (data ?? []) as Promemoria[];
}
