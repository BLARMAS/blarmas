import type { Metadata } from "next";
import MiniCalendario from "../../components/calendario/MiniCalendario";
import Promemoria from "../../components/Promemoria";
import BarraProgresso from "../../components/ui/BarraProgresso";
import Statistica from "../../components/ui/Statistica";
import { caricaAttivita, caricaProgetti, caricaPromemoria, caricaSessione } from "../../lib/db";
import { aggiungiGiorni, formattaGiorno, oggiIso } from "../../lib/date";
import { comeEventi, primoNome } from "../../lib/tipi";

export const metadata: Metadata = { title: "Home" };

export default async function HomePage() {
  const sessione = (await caricaSessione())!; // il layout ha già controllato che ci sia
  const oggi = oggiIso();
  const [progetti, attivita, promemoria] = await Promise.all([
    caricaProgetti(sessione.organizzazioneId, oggi),
    caricaAttivita(sessione),
    caricaPromemoria(sessione),
  ]);

  const aperte = attivita.filter((a) => a.stato !== "Fatto");
  const inRitardo = aperte.filter((a) => a.scadenza && a.scadenza < oggi).length;
  const limite = aggiungiGiorni(oggi, 7);
  const inScadenza = progetti.filter((p) => p.stato !== "Completato" && p.scadenza && p.scadenza >= oggi && p.scadenza <= limite);
  const prossima = aperte
    .filter((a) => a.scadenza && a.scadenza >= oggi)
    .sort((a, b) => (a.scadenza as string).localeCompare(b.scadenza as string))[0];

  return (
    <>
      <h1 className="mb-5 text-[28px] leading-tight font-bold">Buongiorno, {primoNome(sessione.nome)}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Statistica etichetta="Progetti attivi" valore={String(progetti.filter((p) => p.stato !== "Completato").length)} />
        <Statistica etichetta="Attività aperte" valore={String(aperte.length)} />
        <Statistica etichetta="In ritardo" valore={String(inRitardo)} errore={inRitardo > 0} />
        <Statistica etichetta="Attività completate" valore={String(attivita.length - aperte.length)} />
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1.15fr_1fr]">
        <MiniCalendario
          eventi={comeEventi(attivita)}
          oggi={oggi}
          prossimo={prossima ? { titolo: prossima.titolo, data: prossima.scadenza as string } : null}
        />

        <div className="space-y-5">
          <Promemoria promemoria={promemoria} />

          <section className="rounded-xl border border-bordo bg-superficie p-5" aria-labelledby="titolo-scadenze">
            <h2 id="titolo-scadenze" className="text-base font-bold">
              Progetti in scadenza questa settimana
            </h2>
            {inScadenza.length === 0 ? (
              <p className="mt-2 text-[15px] text-testo-sec">Nessun progetto in scadenza nei prossimi 7 giorni.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {inScadenza.map((p) => (
                  <li key={p.id}>
                    <div className="mb-1.5 flex justify-between gap-3 text-[15px]">
                      <span className="font-semibold">{p.nome}</span>
                      <span className={p.stato === "A rischio" ? "font-semibold text-errore" : "text-testo-sec"}>
                        {formattaGiorno(p.scadenza as string)}
                      </span>
                    </div>
                    <BarraProgresso
                      percentuale={p.avanzamento}
                      colore={p.stato === "A rischio" ? "bg-attenzione-barra" : "bg-primario"}
                      etichetta={`Avanzamento ${p.nome}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
