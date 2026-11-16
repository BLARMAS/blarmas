import type { Metadata } from "next";
import CalendarioMese from "../../components/calendario/CalendarioMese";
import { caricaAttivita, caricaSessione } from "../../lib/db";
import { oggiIso } from "../../lib/date";
import { comeEventi } from "../../lib/tipi";

export const metadata: Metadata = { title: "Calendario" };

export default async function CalendarioPage() {
  const sessione = (await caricaSessione())!; // il layout ha già controllato che ci sia
  const attivita = await caricaAttivita(sessione);
  return <CalendarioMese eventi={comeEventi(attivita)} oggi={oggiIso()} />;
}
