import type { Metadata } from "next";
import Prossimamente from "../../components/ui/Prossimamente";
import TitoloPagina from "../../components/ui/TitoloPagina";

export const metadata: Metadata = { title: "Integrazioni" };

export default function IntegrazioniPage() {
  return (
    <>
      <TitoloPagina titolo="Integrazioni" sotto="Collega Blarmas agli strumenti che il tuo team usa già." />
      <Prossimamente testo="Slack, Google Calendar, Google Drive ed email saranno collegabili da qui." />
    </>
  );
}
