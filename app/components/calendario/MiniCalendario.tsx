import Link from "next/link";
import { celleMese, formattaGiorno, NOMI_MESI } from "../../lib/date";
import type { Evento } from "../../lib/tipi";

const giorniSettimana = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

type Props = {
  eventi: Evento[];
  oggi: string; // "2026-11-18"
  prossimo: { titolo: string; data: string } | null; // la prossima scadenza
};

// Piccolo calendario della home: mostra il mese di oggi, con evidenziati i giorni in cui scade qualcosa
export default function MiniCalendario({ eventi, oggi: oggiIso, prossimo }: Props) {
  const anno = Number(oggiIso.slice(0, 4));
  const mese = Number(oggiIso.slice(5, 7)) - 1;
  const settimane = celleMese(anno, mese);
  const conEventi = new Set(eventi.map((e) => e.data));

  return (
    <section className="rounded-xl border border-bordo bg-superficie p-5" aria-labelledby="titolo-mini-cal">
      <div className="flex items-center justify-between gap-3">
        <h2 id="titolo-mini-cal" className="text-base font-bold">
          Calendario · {NOMI_MESI[mese].toLowerCase()} {anno}
        </h2>
        <Link href="/calendario" className="text-sm text-primario hover:underline">
          Apri calendario
        </Link>
      </div>

      <table className="mt-4 w-full table-fixed text-center text-sm">
        <thead>
          <tr>
            {giorniSettimana.map((g) => (
              <th key={g} scope="col" className="pb-2 text-xs font-semibold text-testo-sec">
                {g}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {settimane.map((settimana, i) => (
            <tr key={i}>
              {settimana.map((cella) => {
                if (cella.fuori) return <td key={cella.iso} />;
                const oggi = cella.iso === oggiIso;
                const evidenziato = conEventi.has(cella.iso);
                return (
                  <td key={cella.iso} className="p-0.5">
                    <div
                      className={`flex h-8 items-center justify-center rounded-lg ${
                        oggi
                          ? "bg-primario font-bold text-white"
                          : evidenziato
                            ? "bg-primario-chiaro font-semibold text-primario"
                            : ""
                      }`}
                    >
                      {cella.giorno}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {!prossimo && <p className="mt-4 border-t border-bordo pt-3.5 text-sm text-testo-sec">Nessuna scadenza in arrivo.</p>}
      {prossimo && (
        <p className="mt-4 border-t border-bordo pt-3.5 text-sm">
          Prossima scadenza: <strong>{prossimo.titolo}</strong> · {formattaGiorno(prossimo.data)}
        </p>
      )}
    </section>
  );
}
