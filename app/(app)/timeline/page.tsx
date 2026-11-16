import type { Metadata } from "next";
import TimelineGantt from "../../components/TimelineGantt";
import TitoloPagina from "../../components/ui/TitoloPagina";
import { caricaProgetti, caricaSessione } from "../../lib/db";
import { oggiIso } from "../../lib/date";

export const metadata: Metadata = { title: "Timeline" };

export default async function TimelinePage() {
  const sessione = (await caricaSessione())!; // il layout ha già controllato che ci sia
  const oggi = oggiIso();
  const progetti = await caricaProgetti(sessione.organizzazioneId, oggi);

  return (
    <>
      <TitoloPagina
        titolo="Timeline"
        sotto="I progetti dalla creazione alla scadenza, nelle prossime 8 settimane."
      />
      <TimelineGantt progetti={progetti} oggi={oggi} />
    </>
  );
}
