import type { Metadata } from "next";
import { Suspense } from "react";
import PaginaProgetto from "../../../components/progetti/PaginaProgetto";
import { caricaAttivita, caricaProgetti, caricaSessione } from "../../../lib/db";
import { oggiIso } from "../../../lib/date";

export const metadata: Metadata = { title: "Progetto" };

// L'indirizzo (params) si legge dentro <Suspense>: mentre arriva si vede il segnaposto
export default function ProgettoPage({ params }: PageProps<"/progetti/[id]">) {
  return (
    <Suspense fallback={<p className="text-testo-sec">Caricamento…</p>}>
      <Contenuto params={params} />
    </Suspense>
  );
}

async function Contenuto({ params }: { params: PageProps<"/progetti/[id]">["params"] }) {
  const { id } = await params;
  const sessione = (await caricaSessione())!; // il layout ha già controllato che ci sia
  const oggi = oggiIso();
  const progetti = await caricaProgetti(sessione.organizzazioneId, oggi);
  const progetto = progetti.find((p) => p.id === id);
  const attivita = progetto ? await caricaAttivita(sessione, id) : [];

  return <PaginaProgetto progetto={progetto} attivita={attivita} oggi={oggi} />;
}
