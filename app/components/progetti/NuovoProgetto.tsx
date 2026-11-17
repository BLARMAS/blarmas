"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";
import type { Progetto } from "../../lib/tipi";
import { useRuoli, useSessione } from "../SessioneContext";
import Bottone from "../ui/Bottone";
import Campo from "../ui/Campo";
import CampoEffort from "../ui/CampoEffort";
import Finestra from "../ui/Finestra";

type Props = {
  onChiudi: () => void;
  progetto?: Pick<Progetto, "id" | "nome" | "scadenza" | "ore">; // se c'è, la finestra serve a MODIFICARE quel progetto
};

// La finestra con il modulo: crea un progetto nuovo, oppure ne modifica uno esistente.
// La usano il bottone qui sotto, il menu "+ Nuovo" in alto e il bottone "Modifica" nella pagina del progetto.
export function FinestraNuovoProgetto({ onChiudi: chiudi, progetto }: Props) {
  const router = useRouter();
  const { organizzazioneId } = useSessione();
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);
  return (
    <Finestra titolo={progetto ? "Modifica progetto" : "Nuovo progetto"} onChiudi={chiudi}>
      <form
        onSubmit={async (e) => {
          e.preventDefault(); // evita che la pagina si ricarichi
          const dati = new FormData(e.currentTarget);
          const nome = String(dati.get("progetto-nome")).trim();
          if (!nome) {
            setErrore("Scrivi il nome del progetto.");
            return;
          }
          setErrore("");
          setInCorso(true);
          const scadenza = String(dati.get("progetto-scadenza")) || null;
          const ore = String(dati.get("progetto-effort")) === "" ? null : Number(dati.get("progetto-effort"));
          const tabella = creaClientBrowser().from("progetti");
          // Il database controlla che tu abbia il permesso (regole RLS)
          const { error } = progetto
            ? await tabella.update({ nome, scadenza, ore }).eq("id", progetto.id)
            : await tabella.insert({ organizzazione_id: organizzazioneId, nome, scadenza, ore });
          setInCorso(false);
          if (error) {
            setErrore("Non è stato possibile salvare il progetto. Riprova.");
            return;
          }
          router.refresh(); // rilegge i dati dal server: il nuovo progetto compare
          chiudi();
        }}
        className="space-y-4"
      >
        <Campo id="progetto-nome" etichetta="Nome del progetto" valoreIniziale={progetto?.nome} obbligatorio />
        <Campo id="progetto-scadenza" etichetta="Scadenza" tipo="date" valoreIniziale={progetto?.scadenza ?? undefined} obbligatorio />

        <CampoEffort id="progetto-effort" etichetta="Effort del progetto" oreIniziali={progetto?.ore} />

        <p role="alert" className="text-sm text-errore">
          {errore}
        </p>
        <div className="flex justify-end gap-2">
          <Bottone variante="neutro" onClick={chiudi}>
            Annulla
          </Bottone>
          <Bottone tipo="submit">{inCorso ? "Salvataggio…" : progetto ? "Salva modifiche" : "Crea progetto"}</Bottone>
        </div>
      </form>
    </Finestra>
  );
}

// Bottone "Nuovo progetto" che apre la finestra (non si vede all'ospite, che può solo guardare)
export default function NuovoProgetto() {
  const [aperta, setAperta] = useState(false);
  const { puoScrivere } = useRuoli();
  if (!puoScrivere) return null;

  return (
    <>
      <Bottone onClick={() => setAperta(true)}>Nuovo progetto</Bottone>
      {aperta && <FinestraNuovoProgetto onChiudi={() => setAperta(false)} />}
    </>
  );
}
