"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { aggiungiGiorni, formattaData } from "../lib/date";
import { creaClientBrowser } from "../lib/supabase/client";
import type { Attivita } from "../lib/tipi";
import { useRuoli } from "./SessioneContext";

// Le attività assegnate a chi è collegato, divise per urgenza.
// La casella segna l'attività come fatta (si salva nel database).
export default function MieAttivita({ attivita, oggi }: { attivita: Attivita[]; oggi: string }) {
  const router = useRouter();
  const { puoScrivere } = useRuoli();
  const [errore, setErrore] = useState("");

  const limite = aggiungiGiorni(oggi, 7);
  const aperte = attivita.filter((a) => a.stato !== "Fatto");
  const gruppi = [
    { nome: "In ritardo", ritardo: true, voci: aperte.filter((a) => a.scadenza && a.scadenza < oggi) },
    { nome: "Questa settimana", ritardo: false, voci: aperte.filter((a) => a.scadenza && a.scadenza >= oggi && a.scadenza <= limite) },
    { nome: "Più avanti", ritardo: false, voci: aperte.filter((a) => !a.scadenza || a.scadenza > limite) },
    { nome: "Completate", ritardo: false, voci: attivita.filter((a) => a.stato === "Fatto") },
  ].filter((g) => g.voci.length > 0);

  async function cambia(a: Attivita) {
    setErrore("");
    const stato = a.stato === "Fatto" ? "Da fare" : "Fatto";
    const { error } = await creaClientBrowser().from("attivita").update({ stato }).eq("id", a.id);
    if (error) {
      setErrore("Non è stato possibile aggiornare l'attività.");
      return;
    }
    router.refresh();
  }

  if (attivita.length === 0) {
    return (
      <p className="rounded-xl border border-bordo bg-superficie p-5 text-testo-sec">
        Non hai attività assegnate. Quando te ne assegnano una, la trovi qui.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p role="alert" className="text-sm text-errore">
        {errore}
      </p>
      {gruppi.map((gruppo) => (
        <section key={gruppo.nome} aria-labelledby={`gruppo-${gruppo.nome}`}>
          <h2
            id={`gruppo-${gruppo.nome}`}
            className={`mb-2 text-sm font-bold ${gruppo.ritardo ? "text-errore" : "text-testo-sec"}`}
          >
            {gruppo.nome} · {gruppo.voci.length}
          </h2>
          <ul className="space-y-2.5">
            {gruppo.voci.map((v) => (
              <li key={v.id}>
                <label className="flex min-h-12 cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-bordo bg-superficie px-5 py-2 text-[15px]">
                  <input
                    type="checkbox"
                    checked={v.stato === "Fatto"}
                    disabled={!puoScrivere}
                    onChange={() => cambia(v)}
                    className="h-4 w-4 accent-primario"
                  />
                  <span className={`flex-1 font-medium ${v.stato === "Fatto" ? "text-testo-sec line-through" : ""}`}>
                    {v.titolo}
                  </span>
                  <span className="text-[13px] text-testo-sec">
                    {v.progettoNome} · {formattaData(v.scadenza)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
