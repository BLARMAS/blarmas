"use client";

import { useState } from "react";
import { calcolaCarico, periodi, type Periodo } from "../../lib/carico";
import { formattaData } from "../../lib/date";
import { formattaNumero, formattaOre, nomeMembro, oreRestantiAttivita, type Attivita } from "../../lib/tipi";
import { useSessione } from "../SessioneContext";
import BarraProgresso from "../ui/BarraProgresso";
import CalendarioCarico from "./CalendarioCarico";
import { Cella, Tabella } from "../ui/Tabella";

// Verde sotto l'80% della capacità, arancione fino al 100%, rosso oltre
function coloreCarico(percentuale: number) {
  if (percentuale > 100) return { barra: "bg-errore", testo: "text-errore" };
  if (percentuale >= 80) return { barra: "bg-attenzione-barra", testo: "text-attenzione" };
  return { barra: "bg-successo", testo: "text-successo" };
}

const campoFiltro = "h-11 rounded-lg border border-bordo-campo bg-superficie px-3 text-sm font-medium";

// Tabella del carico di lavoro: una riga per persona. Cliccando il nome si vedono le sue attività aperte.
// Si usa nella pagina "Carico di lavoro" (tutte le attività) e dentro un progetto (solo le sue).
export default function TabellaCarico({ attivita, oggi }: { attivita: Attivita[]; oggi: string }) {
  const { membri } = useSessione();
  const [periodo, setPeriodo] = useState<Periodo>("quattro-settimane");
  const [aperta, setAperta] = useState<string | null>(null); // la persona di cui si vedono le attività
  const [vista, setVista] = useState<"tabella" | "calendario">("tabella");

  const righe = calcolaCarico(membri, attivita, oggi, periodo);
  const capacita = righe[0]?.capacita ?? 0;
  const senzaOreTotale = righe.reduce((somma, r) => somma + r.senzaOre, 0);
  const senzaScadenzaTotale = righe.reduce((somma, r) => somma + r.senzaScadenza, 0);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-x-4 gap-y-2">
        <div className="flex gap-1 rounded-xl bg-colonna p-1" role="group" aria-label="Tipo di vista">
          {(["tabella", "calendario"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={vista === v}
              onClick={() => setVista(v)}
              className={`min-h-11 rounded-lg px-4 text-sm font-semibold ${vista === v ? "bg-superficie text-testo shadow-sm" : "text-testo-sec"}`}
            >
              {v === "tabella" ? "Tabella" : "Calendario"}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="periodo-carico" className="block text-sm font-semibold">
            Periodo
          </label>
          <select
            id="periodo-carico"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as Periodo)}
            className={`${campoFiltro} mt-1.5`}
          >
            {periodi.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
        {vista === "tabella" && (
        <p className="pb-2 text-sm text-testo-sec">
          Capacità di ogni persona da oggi: <strong className="text-testo">{formattaOre(capacita)}</strong> (8 ore per
          ogni giorno lavorativo)
        </p>
        )}
      </div>

      {vista === "calendario" ? (
        <CalendarioCarico attivita={attivita} oggi={oggi} periodo={periodo} />
      ) : righe.length === 0 ? (
        <p className="rounded-xl border border-bordo bg-superficie p-5 text-testo-sec">
          Non ci sono ancora persone con attività assegnate.
        </p>
      ) : (
        <Tabella intestazioni={["Persona", "Attività aperte", "Assegnate", "Consumate", "Restanti", "In ritardo", "Carico"]}>
          {righe.map((r) => {
            const colore = r.percentuale === null ? null : coloreCarico(r.percentuale);
            const espansa = aperta === r.membro.id;
            return [
              <tr key={r.membro.id}>
                <Cella className="font-semibold">
                  <button
                    type="button"
                    aria-expanded={espansa}
                    onClick={() => setAperta(espansa ? null : r.membro.id)}
                    className="min-h-11 text-left hover:text-primario hover:underline"
                  >
                    {nomeMembro(r.membro)}
                    <span className="sr-only">: mostra le attività</span>
                  </button>
                  {r.membro.segnaposto && <span className="ml-2 text-xs font-normal text-testo-sec">segnaposto</span>}
                </Cella>
                <Cella>{r.aperte.length}</Cella>
                <Cella>{formattaOre(r.orePianificate)}</Cella>
                <Cella>{formattaOre(r.oreConsumate)}</Cella>
                <Cella className="font-semibold">{formattaOre(r.oreRestanti)}</Cella>
                <Cella className={r.inRitardo > 0 ? "font-semibold text-errore" : ""}>{r.inRitardo}</Cella>
                <Cella className="min-w-[170px]">
                  {r.percentuale === null || colore === null ? (
                    <span className="text-testo-sec">—</span>
                  ) : (
                    <>
                      <BarraProgresso
                        percentuale={Math.min(100, r.percentuale)}
                        colore={colore.barra}
                        etichetta={`Carico di ${nomeMembro(r.membro)}`}
                      />
                      <span className={`mt-1 block text-[13px] font-semibold ${colore.testo}`}>
                        {formattaNumero(Math.round(r.percentuale))}%
                        <span className="font-normal text-testo-sec">
                          {" "}
                          ({formattaOre(r.oreRestanti)} su {formattaOre(r.capacita)})
                        </span>
                      </span>
                    </>
                  )}
                </Cella>
              </tr>,
              espansa && (
                <tr key={`${r.membro.id}-attivita`} className="bg-sfondo">
                  <td colSpan={7} className="px-5 py-3">
                    {r.aperte.length === 0 ? (
                      <p className="text-sm text-testo-sec">Nessuna attività aperta.</p>
                    ) : (
                      <ul className="space-y-1.5 text-sm">
                        {[...r.aperte]
                          .sort((a, b) => (a.scadenza ?? "9999").localeCompare(b.scadenza ?? "9999"))
                          .map((a) => {
                            const restanti = oreRestantiAttivita(a);
                            const scaduta = a.scadenza !== null && a.scadenza < oggi;
                            return (
                              <li key={a.id} className="flex flex-wrap justify-between gap-x-4">
                                <span>
                                  {a.titolo} <span className="text-testo-sec">· {a.progettoNome}</span>
                                </span>
                                <span className="text-testo-sec">
                                  <span className={scaduta ? "font-semibold text-errore" : ""}>
                                    {a.scadenza ? formattaData(a.scadenza) : "senza scadenza"}
                                  </span>
                                  {" · "}
                                  {restanti === null ? "ore non indicate" : `restano ${formattaOre(restanti)}`}
                                </span>
                              </li>
                            );
                          })}
                      </ul>
                    )}
                  </td>
                </tr>
              ),
            ];
          })}
        </Tabella>
      )}

      {(senzaOreTotale > 0 || senzaScadenzaTotale > 0) && (
        <p className="mt-3 text-sm text-testo-sec">
          {senzaOreTotale > 0 && `${senzaOreTotale} attività aperte non hanno le ore indicate e non pesano sul carico. `}
          {senzaScadenzaTotale > 0 && `${senzaScadenzaTotale} non hanno la scadenza e non rientrano in nessun periodo.`}
        </p>
      )}
    </>
  );
}
