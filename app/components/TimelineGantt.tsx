import { aggiungiGiorni, formattaData, giorniTra, lunediDi } from "../lib/date";
import type { Progetto } from "../lib/tipi";

const SETTIMANE = 8;
const GIORNI = SETTIMANE * 7;

const colori = {
  "In corso": { barra: "bg-primario", testo: "in corso" },
  Completato: { barra: "bg-successo", testo: "completato" },
  "A rischio": { barra: "bg-attenzione-barra", testo: "a rischio" },
};

// Timeline (diagramma di Gantt) dei progetti: ogni barra va dall'inizio del progetto (o dalla creazione, se manca) alla sua scadenza.
// Si vedono 8 settimane a partire dalla settimana di oggi. Posizione e larghezza sono percentuali sui 56 giorni.
export default function TimelineGantt({ progetti, oggi }: { progetti: Progetto[]; oggi: string }) {
  const inizio = lunediDi(oggi);
  const settimane = Array.from({ length: SETTIMANE }, (_, i) => formattaData(aggiungiGiorni(inizio, i * 7)));

  if (progetti.length === 0) {
    return (
      <p className="rounded-xl border border-bordo bg-superficie p-5 text-testo-sec">
        Non ci sono ancora progetti da mostrare.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-bordo bg-superficie">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[260px_1fr] bg-sfondo text-xs font-semibold text-testo-sec">
            <div className="px-4 py-3.5">Progetto</div>
            <div className="grid grid-cols-8">
              {settimane.map((s) => (
                <div key={s} className="py-3.5">
                  {s}
                </div>
              ))}
            </div>
          </div>

          <ul>
            {progetti.map((p) => {
              // Giorni dall'inizio della timeline; la barra si ferma ai bordi se esce dal periodo
              const da = Math.max(0, giorniTra(inizio, p.inizio ?? p.creato)); // senza data di inizio si parte dalla creazione
              const a = p.scadenza ? Math.min(GIORNI, giorniTra(inizio, p.scadenza) + 1) : null;
              const visibile = a !== null && a > da;
              return (
                <li key={p.id} className="grid h-[57px] grid-cols-[260px_1fr] border-t border-bordo">
                  <div className="flex flex-col justify-center px-4 text-[15px]">
                    <span>{p.nome}</span>
                    {!p.scadenza && <span className="text-xs text-testo-sec">Senza scadenza</span>}
                    {p.scadenza && !visibile && (
                      <span className="text-xs text-testo-sec">Fuori da queste 8 settimane</span>
                    )}
                  </div>
                  {/* Le righe verticali segnano le settimane */}
                  <div className="relative bg-[linear-gradient(to_right,var(--color-bordo)_1px,transparent_1px)] bg-[length:12.5%_100%]">
                    {visibile && (
                      <div
                        className={`absolute top-1/2 h-6 -translate-y-1/2 rounded-md ${colori[p.stato].barra}`}
                        style={{
                          left: `${(da / GIORNI) * 100}%`,
                          width: `${(((a as number) - da) / GIORNI) * 100}%`,
                        }}
                      >
                        <span className="sr-only">
                          {p.nome}: {colori[p.stato].testo}, scadenza {formattaData(p.scadenza)}
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <p className="mt-3 flex flex-wrap gap-x-6 text-sm text-testo-sec">
        <span>Blu: in corso</span>
        <span>Verde: completato</span>
        <span>Arancio: a rischio</span>
      </p>
    </>
  );
}
