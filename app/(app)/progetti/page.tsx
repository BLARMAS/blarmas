import type { Metadata } from "next";
import PaginaProgetti from "../../components/progetti/PaginaProgetti";
import { caricaAttivita, caricaProgetti, caricaSessione } from "../../lib/db";
import { aggiungiGiorni, oggiIso } from "../../lib/date";

export const metadata: Metadata = { title: "Progetti" };

export default async function ProgettiPage() {
  const sessione = (await caricaSessione())!; // il layout ha già controllato che ci sia
  const oggi = oggiIso();
  const [progetti, attivita] = await Promise.all([
    caricaProgetti(sessione.organizzazioneId, oggi),
    caricaAttivita(sessione),
  ]);

  const limite = aggiungiGiorni(oggi, 7);
  const inScadenza = attivita.filter((a) => a.stato !== "Fatto" && a.scadenza && a.scadenza <= limite).length;
  const completate = attivita.filter((a) => a.stato === "Fatto").length;

  return <PaginaProgetti progetti={progetti} inScadenza={inScadenza} completate={completate} />;
}
