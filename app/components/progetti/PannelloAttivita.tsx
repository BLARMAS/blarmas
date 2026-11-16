"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";
import { stati, type Attivita, type Stato } from "../../lib/tipi";
import { formattaData } from "../../lib/date";
import { useRuoli } from "../SessioneContext";
import Badge from "../ui/Badge";
import Bottone from "../ui/Bottone";
import FinestraConferma from "../ui/FinestraConferma";
import { FinestraNuovaAttivita } from "./NuovaAttivita";

type PannelloProps = {
  attivita: Attivita;
  onChiudi: () => void;
  onCambiaStato: (id: string, stato: Stato) => void;
};

const tonoStato = { "Da fare": "attenzione", "In corso": "primario", Fatto: "successo" } as const;

// Pannello laterale con il dettaglio di un'attività
export default function PannelloAttivita({ attivita, onChiudi, onCambiaStato }: PannelloProps) {
  const router = useRouter();
  const { puoScrivere } = useRuoli();
  const [finestra, setFinestra] = useState<"modifica" | "elimina" | null>(null);
  const chiudiRef = useRef<HTMLButtonElement>(null);

  // All'apertura il focus va sul bottone di chiusura (una sola volta)
  useEffect(() => {
    chiudiRef.current?.focus();
  }, []);

  // Con Esc il pannello si chiude
  useEffect(() => {
    // Se sopra al pannello c'è una finestra (modifica/elimina), Esc chiude solo quella
    const chiudi = (e: KeyboardEvent) =>
      e.key === "Escape" && document.querySelectorAll('[aria-modal="true"]').length === 1 && onChiudi();
    window.addEventListener("keydown", chiudi);
    return () => window.removeEventListener("keydown", chiudi);
  }, [onChiudi]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Sfondo scuro: un clic fuori dal pannello lo chiude */}
      <button type="button" aria-label="Chiudi il pannello" tabIndex={-1} onClick={onChiudi} className="absolute inset-0 bg-black/30" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="titolo-pannello"
        className="relative h-full w-full max-w-[460px] overflow-y-auto bg-superficie p-6 shadow-xl sm:p-7"
      >
        <div className="flex items-center justify-between">
          <Badge testo={attivita.stato} tono={tonoStato[attivita.stato]} />
          <button
            ref={chiudiRef}
            type="button"
            onClick={onChiudi}
            aria-label="Chiudi"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-xl text-testo-sec hover:bg-sfondo"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <h2 id="titolo-pannello" className="mt-3 text-[22px] leading-tight font-bold">
          {attivita.titolo}
        </h2>

        <dl className="mt-4 grid grid-cols-[110px_1fr] items-center gap-y-1.5 text-[15px]">
          <dt className="text-testo-sec">Stato</dt>
          <dd>
            <label htmlFor="stato-attivita" className="sr-only">
              Stato dell&apos;attività
            </label>
            <select
              id="stato-attivita"
              value={attivita.stato}
              onChange={(e) => onCambiaStato(attivita.id, e.target.value as Stato)}
              disabled={!puoScrivere}
              className="h-11 rounded-lg border border-bordo-campo bg-superficie px-2"
            >
              {stati.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </dd>
          <dt className="text-testo-sec">Assegnata a</dt>
          <dd>{attivita.assegnatario}</dd>
          <dt className="text-testo-sec">Scadenza</dt>
          <dd>{formattaData(attivita.scadenza, "lunga")}</dd>
          <dt className="text-testo-sec">Priorità</dt>
          <dd>{attivita.priorita}</dd>
          <dt className="text-testo-sec">Etichette</dt>
          <dd>{attivita.etichette.length ? attivita.etichette.join(", ") : "Nessuna"}</dd>
        </dl>

        <h3 className="mt-5 text-[15px] font-bold">Descrizione</h3>
        <p className="mt-1 text-[15px] text-testo-sec">{attivita.descrizione || "Nessuna descrizione."}</p>

        {puoScrivere && (
          <div className="mt-5 flex flex-wrap gap-2">
            <Bottone variante="neutro" onClick={() => setFinestra("modifica")}>
              Modifica
            </Bottone>
            <Bottone variante="neutro" onClick={() => setFinestra("elimina")}>
              Elimina
            </Bottone>
          </div>
        )}

        <h3 className="mt-5 text-[15px] font-bold">Sotto-attività e commenti</h3>
        <p className="mt-1 text-[15px] text-testo-sec">Disponibili prossimamente.</p>
      </aside>

      {finestra === "modifica" && <FinestraNuovaAttivita attivita={attivita} onChiudi={() => setFinestra(null)} />}
      {finestra === "elimina" && (
        <FinestraConferma
          titolo="Eliminare l'attività?"
          testo={`Stai per eliminare “${attivita.titolo}”. L'operazione non si può annullare.`}
          etichettaConferma="Elimina attività"
          onConferma={async () => {
            const { error } = await creaClientBrowser().from("attivita").delete().eq("id", attivita.id);
            if (error) return "Non è stato possibile eliminare l'attività. Riprova.";
            onChiudi();
            router.refresh(); // rilegge i dati dal server: l'attività non c'è più
            return null;
          }}
          onChiudi={() => setFinestra(null)}
        />
      )}
    </div>
  );
}
