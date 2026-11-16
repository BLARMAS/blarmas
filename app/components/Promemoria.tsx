"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formattaData } from "../lib/date";
import { creaClientBrowser } from "../lib/supabase/client";
import type { Promemoria as TipoPromemoria } from "../lib/tipi";
import { useSessione } from "./SessioneContext";
import Bottone from "./ui/Bottone";
import Campo from "./ui/Campo";
import Finestra from "./ui/Finestra";

// Finestra con il modulo per un nuovo promemoria
function FinestraPromemoria({ onChiudi }: { onChiudi: () => void }) {
  const router = useRouter();
  const { organizzazioneId, utenteId } = useSessione();
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);

  return (
    <Finestra titolo="Nuovo promemoria" onChiudi={onChiudi}>
      <form
        onSubmit={async (e) => {
          e.preventDefault(); // evita che la pagina si ricarichi
          const dati = new FormData(e.currentTarget);
          const testo = String(dati.get("promemoria-testo")).trim();
          if (!testo) {
            setErrore("Scrivi cosa devi ricordare.");
            return;
          }
          setErrore("");
          setInCorso(true);
          const { error } = await creaClientBrowser()
            .from("promemoria")
            .insert({
              organizzazione_id: organizzazioneId,
              utente_id: utenteId,
              testo,
              scadenza: String(dati.get("promemoria-scadenza")) || null,
            });
          setInCorso(false);
          if (error) {
            setErrore("Non è stato possibile salvare il promemoria. Riprova.");
            return;
          }
          router.refresh(); // rilegge i dati dal server
          onChiudi();
        }}
        className="space-y-4"
      >
        <Campo id="promemoria-testo" etichetta="Cosa devi ricordare?" obbligatorio />
        <Campo id="promemoria-scadenza" etichetta="Quando (facoltativo)" tipo="date" />
        <p role="alert" className="text-sm text-errore">
          {errore}
        </p>
        <div className="flex justify-end gap-2">
          <Bottone variante="neutro" onClick={onChiudi}>
            Annulla
          </Bottone>
          <Bottone tipo="submit">{inCorso ? "Salvataggio…" : "Aggiungi"}</Bottone>
        </div>
      </form>
    </Finestra>
  );
}

// Elenco di promemoria personali con caselle da spuntare e bottone "+ Aggiungi"
export default function Promemoria({ promemoria }: { promemoria: TipoPromemoria[] }) {
  const router = useRouter();
  const [aperta, setAperta] = useState(false);
  const [errore, setErrore] = useState("");

  async function cambia(p: TipoPromemoria) {
    setErrore("");
    const { error } = await creaClientBrowser().from("promemoria").update({ fatto: !p.fatto }).eq("id", p.id);
    if (error) {
      setErrore("Non è stato possibile aggiornare il promemoria.");
      return;
    }
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-bordo bg-superficie p-5" aria-labelledby="titolo-promemoria">
      <div className="flex items-center justify-between gap-3">
        <h2 id="titolo-promemoria" className="text-base font-bold">
          Promemoria
        </h2>
        <button type="button" onClick={() => setAperta(true)} className="min-h-11 text-sm text-primario hover:underline">
          + Aggiungi
        </button>
      </div>

      {promemoria.length === 0 ? (
        <p className="mt-1 text-[15px] text-testo-sec">Nessun promemoria. Aggiungine uno con “+ Aggiungi”.</p>
      ) : (
        <ul className="mt-1">
          {promemoria.map((p) => (
            <li key={p.id}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
                <input type="checkbox" checked={p.fatto} onChange={() => cambia(p)} className="h-4 w-4 accent-primario" />
                <span className={`flex-1 ${p.fatto ? "text-testo-sec line-through" : ""}`}>{p.testo}</span>
                <span className="text-xs text-testo-sec">{p.scadenza ? formattaData(p.scadenza) : ""}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <p role="alert" className="text-sm text-errore">
        {errore}
      </p>

      {aperta && <FinestraPromemoria onChiudi={() => setAperta(false)} />}
    </section>
  );
}
