import type { Metadata } from "next";
import MieAttivita from "../../components/MieAttivita";
import NuovaAttivita from "../../components/progetti/NuovaAttivita";
import TitoloPagina from "../../components/ui/TitoloPagina";
import { caricaAttivita, caricaSessione } from "../../lib/db";
import { oggiIso } from "../../lib/date";

export const metadata: Metadata = { title: "Le mie attività" };

export default async function LeMieAttivitaPage() {
  const sessione = (await caricaSessione())!; // il layout ha già controllato che ci sia
  const tutte = await caricaAttivita(sessione);
  const mie = tutte.filter((a) => a.assegnatarioId === sessione.membroId);

  return (
    <>
      <TitoloPagina titolo="Le mie attività" azione={<NuovaAttivita />} />
      <MieAttivita attivita={mie} oggi={oggiIso()} />
    </>
  );
}
