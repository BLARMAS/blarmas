"use client";

import { useState } from "react";
import { calcolaGiornaliero, fineDelPeriodo, type Periodo } from "../../lib/carico";
import { formattaData, formattaGiorno } from "../../lib/date";
import { formattaNumero, formattaOre, nomeMembro, ORE_PER_GIORNO, type Attivita } from "../../lib/tipi";
import { useSessione } from "../SessioneContext";

// Una cella: meno di 8 ore = ore libere (blu); 8 ore = giornata piena (verde); più di 8 ore = sovraccarico (rosso)
function stileOre(ore: number) {
  if (ore === 0) return { classe: "text-testo-sec", testo: "libero" };
  if (ore > ORE_PER_GIORNO + 0.05) return { classe: "bg-attenzione-sfondo font-bold text-errore", testo: "sovraccarico" };
  if (ore >= ORE_PER_GIORNO - 0.05) return { classe: "bg-successo-sfondo font-bold text-successo", testo: "giornata piena" };
  return { classe: "bg-primario-chiaro font-semibold text-primario", testo: "ore libere" };
}

const arrotonda1 = (n: number) => Math.round(n * 10) / 10;

type Selezione = { membroId: string; giorno: string };

// Calendario del carico: una riga per persona, una colonna per giorno lavorativo.
// Ogni numero è il totale delle ore previste quel giorno, ricavato dalle attività aperte della persona.
export default function CalendarioCarico({
  attivita,
  oggi,
  periodo,
}: {
  attivita: Attivita[];
  oggi: string;
  periodo: Periodo;
}) {
  const { membri } = useSessione();
  const [scelta, setScelta] = useState<Selezione | null>(null);

  const { giorni, righe } = calcolaGiornaliero(membri, attivita, oggi, fineDelPeriodo(periodo, oggi));
  const rigaScelta = scelta ? righe.find((r) => r.membro.id === scelta.membroId) : undefined;
  const contributiScelti = rigaScelta && scelta ? (rigaScelta.contributi[scelta.giorno] ?? []) : [];
  const nSenzaPianificazione = righe.reduce((somma, r) => somma + r.senzaPianificazione.length, 0);

  if (righe.length === 0 || giorni.length === 0) {
    return (
      <p className="rounded-xl border border-bordo bg-superficie p-5 text-testo-sec">
        {giorni.length === 0
          ? "Nel periodo scelto non ci sono giorni lavorativi: scegli un periodo più lungo."
          : "Non ci sono ancora persone con attività assegnate."}
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-bordo bg-superficie">
        <table className="w-full border-collapse text-center text-sm">
          <caption className="sr-only">Ore previste per persona e per giorno lavorativo</caption>
          <thead>
            <tr className="border-b border-bordo">
              <th scope="col" className="sticky left-0 z-10 min-w-[140px] bg-superficie px-4 py-3 text-left text-xs font-semibold text-testo-sec">
                Persona
              </th>
              {giorni.map((giorno, i) => {
                const [settimana, numero, mese] = formattaGiorno(giorno).split(" "); // "mar 17 nov"
                const inizioMese = i === 0 || numero === "1";
                return (
                  <th key={giorno} scope="col" className="min-w-[46px] px-1 py-2 text-xs font-semibold text-testo-sec">
                    <span className="block font-normal">{settimana}</span>
                    <span className="block text-sm text-testo">{numero}</span>
                    <span className="block h-3.5 font-normal">{inizioMese ? mese : ""}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-bordo">
            {righe.map((r) => (
              <tr key={r.membro.id}>
                <th scope="row" className="sticky left-0 z-10 bg-superficie px-4 py-1.5 text-left text-[15px] font-semibold">
                  {nomeMembro(r.membro)}
                  {r.membro.segnaposto && <span className="ml-2 text-xs font-normal text-testo-sec">segnaposto</span>}
                </th>
                {giorni.map((giorno) => {
                  const ore = r.ore[giorno] ?? 0;
                  const stile = stileOre(ore);
                  const scelta_ = scelta?.membroId === r.membro.id && scelta.giorno === giorno;
                  return (
                    <td key={giorno} className="p-0.5">
                      <button
                        type="button"
                        aria-pressed={scelta_}
                        aria-label={`${nomeMembro(r.membro)}, ${formattaData(giorno)}: ${formattaNumero(arrotonda1(ore))} ore, ${stile.testo}`}
                        onClick={() => setScelta(scelta_ ? null : { membroId: r.membro.id, giorno })}
                        className={`h-11 w-full min-w-[42px] rounded-md text-[13px] ${stile.classe} ${scelta_ ? "outline-2 outline-primario" : ""}`}
                      >
                        {ore === 0 ? "–" : formattaNumero(arrotonda1(ore))}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-testo-sec">
        <span>
          <strong className="text-primario">Blu</strong>: meno di {ORE_PER_GIORNO} h (ore libere)
        </span>
        <span>
          <strong className="text-successo">Verde</strong>: {ORE_PER_GIORNO} h, giornata piena
        </span>
        <span>
          <strong className="text-errore">Rosso</strong>: più di {ORE_PER_GIORNO} h, sovraccarico
        </span>
      </p>
      <p className="mt-1 text-sm text-testo-sec">
        Le ore restanti di ogni attività sono divise in parti uguali sui giorni lavorativi tra l&apos;inizio (o oggi) e la
        scadenza. Le attività già scadute pesano su oggi.
      </p>

      {/* Dettaglio della cella scelta */}
      <div aria-live="polite" className="mt-4">
        {rigaScelta && scelta && (
          <section className="rounded-xl border border-bordo bg-superficie p-4">
            <h2 className="text-base font-bold">
              {nomeMembro(rigaScelta.membro)} · {formattaData(scelta.giorno, "lunga")}
            </h2>
            {contributiScelti.length === 0 ? (
              <p className="mt-1 text-[15px] text-testo-sec">Nessuna attività prevista: {formattaOre(ORE_PER_GIORNO)} libere.</p>
            ) : (
              <>
                <ul className="mt-2 space-y-1.5 text-[15px]">
                  {contributiScelti.map((c) => (
                    <li key={c.attivita.id} className="flex flex-wrap justify-between gap-x-4">
                      <span>
                        {c.attivita.titolo} <span className="text-testo-sec">· {c.attivita.progettoNome}</span>
                      </span>
                      <span className="font-semibold">{formattaNumero(arrotonda1(c.ore))} h</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 border-t border-bordo pt-2 text-[15px] font-semibold">
                  Totale {formattaNumero(arrotonda1(contributiScelti.reduce((s, c) => s + c.ore, 0)))} h su {ORE_PER_GIORNO} h
                </p>
              </>
            )}
          </section>
        )}
      </div>

      {nSenzaPianificazione > 0 && (
        <p className="mt-3 text-sm text-testo-sec">
          {nSenzaPianificazione} attività aperte non sono nel calendario perché mancano le ore o la scadenza.
        </p>
      )}
    </>
  );
}
