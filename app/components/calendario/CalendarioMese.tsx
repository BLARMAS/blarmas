"use client";

import { useState } from "react";
import { celleMese, NOMI_MESI } from "../../lib/date";
import type { Evento } from "../../lib/tipi";
import Bottone from "../ui/Bottone";

const giorniSettimana = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

// Verde = attività fatta; blu = ancora da fare
const coloriEvento = {
  fatto: "bg-successo-sfondo text-successo",
  aperta: "bg-primario-chiaro text-primario",
};

// Calendario completo del mese, con i bottoni ‹ Oggi ›. Ogni attività con scadenza è una voce.
export default function CalendarioMese({ eventi, oggi }: { eventi: Evento[]; oggi: string }) {
  // Il mese mostrato parte da quello di oggi
  const annoOggi = Number(oggi.slice(0, 4));
  const meseOggi = Number(oggi.slice(5, 7)) - 1;
  const [anno, setAnno] = useState(annoOggi);
  const [mese, setMese] = useState(meseOggi);

  function cambiaMese(passo: number) {
    const nuovo = new Date(Date.UTC(anno, mese + passo, 1));
    setAnno(nuovo.getUTCFullYear());
    setMese(nuovo.getUTCMonth());
  }

  const settimane = celleMese(anno, mese);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] leading-tight font-bold">
          {NOMI_MESI[mese]} {anno}
        </h1>
        <div className="flex gap-2">
          <Bottone variante="neutro" onClick={() => cambiaMese(-1)}>
            <span className="sr-only">Mese precedente</span>
            <span aria-hidden="true">‹</span>
          </Bottone>
          <Bottone
            variante="neutro"
            onClick={() => {
              setAnno(annoOggi);
              setMese(meseOggi);
            }}
          >
            Oggi
          </Bottone>
          <Bottone variante="neutro" onClick={() => cambiaMese(1)}>
            <span className="sr-only">Mese successivo</span>
            <span aria-hidden="true">›</span>
          </Bottone>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse border border-bordo bg-superficie text-sm">
          <thead>
            <tr className="bg-sfondo">
              {giorniSettimana.map((g) => (
                <th key={g} scope="col" className="border border-bordo px-2.5 py-2.5 text-left text-xs font-semibold text-testo-sec">
                  {g}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {settimane.map((settimana, i) => (
              <tr key={i}>
                {settimana.map((cella) => {
                  const eOggi = cella.iso === oggi;
                  const delGiorno = eventi.filter((e) => e.data === cella.iso);
                  return (
                    <td
                      key={cella.iso}
                      className={`h-28 border border-bordo p-2 align-top ${
                        eOggi ? "bg-primario-chiaro" : cella.fuori ? "bg-sfondo text-testo-sec" : ""
                      }`}
                    >
                      <span className={eOggi ? "font-bold text-primario" : ""}>{cella.giorno}</span>
                      <ul className="mt-1 space-y-1">
                        {delGiorno.map((e) => (
                          <li key={e.id} className={`rounded px-2 py-1 text-xs font-semibold ${coloriEvento[e.fatto ? "fatto" : "aperta"]}`}>
                            {e.titolo}
                          </li>
                        ))}
                      </ul>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
