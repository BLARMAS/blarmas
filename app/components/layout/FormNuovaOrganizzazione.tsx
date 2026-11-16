"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";
import Bottone from "../ui/Bottone";
import Campo from "../ui/Campo";

// Per chi è collegato ma non ha ancora un'organizzazione: ne crea una (e ne diventa l'admin)
export default function FormNuovaOrganizzazione() {
  const router = useRouter();
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const dati = new FormData(e.currentTarget);
        const organizzazione = String(dati.get("organizzazione")).trim();
        if (!organizzazione) {
          setErrore("Scrivi il nome dell'organizzazione.");
          return;
        }
        setErrore("");
        setInCorso(true);
        const { error } = await creaClientBrowser().rpc("crea_organizzazione", {
          nome_organizzazione: organizzazione,
          nome_persona: String(dati.get("nome")).trim(),
        });
        if (error) {
          setInCorso(false);
          setErrore("Non è stato possibile creare l'organizzazione. Riprova.");
          return;
        }
        router.refresh(); // rilegge i dati dal server: ora la home si apre
      }}
      className="mt-5 space-y-4"
    >
      <Campo id="organizzazione" etichetta="Nome dell'organizzazione" suggerimento="Es. Studio Rossi" obbligatorio />
      <Campo id="nome" etichetta="Il tuo nome e cognome" autoComplete="name" />
      {/* role="alert": gli screen reader leggono subito l'errore quando compare */}
      <p role="alert" className="text-sm text-errore">
        {errore}
      </p>
      <Bottone tipo="submit" className="h-12 w-full">
        {inCorso ? "Creazione in corso…" : "Crea organizzazione"}
      </Bottone>
    </form>
  );
}
