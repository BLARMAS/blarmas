"use client";

import { createContext, useContext } from "react";
import type { Sessione } from "../lib/tipi";

const SessioneContext = createContext<Sessione | null>(null);

// Mette a disposizione di tutti i componenti "chi sono" e le persone/progetti dell'organizzazione.
// I dati arrivano dal server (layout) e si aggiornano ogni volta che la pagina viene ricaricata dal server.
export function SessioneProvider({ sessione, children }: { sessione: Sessione; children: React.ReactNode }) {
  return <SessioneContext.Provider value={sessione}>{children}</SessioneContext.Provider>;
}

// Per usarla in un componente: const { ruolo, organizzazioneId } = useSessione();
export function useSessione() {
  const sessione = useContext(SessioneContext);
  if (!sessione) throw new Error("useSessione va usato dentro SessioneProvider");
  return sessione;
}

// Chi può creare progetti e attività (l'ospite può solo guardare)
export function useRuoli() {
  const { ruolo } = useSessione();
  return { puoScrivere: ruolo !== "ospite", eAdmin: ruolo === "admin" };
}
