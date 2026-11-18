import type { Metadata } from "next";
import PaginaCarico from "../../components/carico/PaginaCarico";
import { caricaAttivita, caricaSessione } from "../../lib/db";
import { oggiIso } from "../../lib/date";

export const metadata: Metadata = { title: "Carico di lavoro" };

export default async function CaricoPage() {
  const sessione = (await caricaSessione())!; // il layout ha già controllato che ci sia
  const attivita = await caricaAttivita(sessione);
  return <PaginaCarico attivita={attivita} oggi={oggiIso()} />;
}
