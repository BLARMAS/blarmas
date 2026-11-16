import type { Metadata } from "next";
import Prossimamente from "../../components/ui/Prossimamente";
import TitoloPagina from "../../components/ui/TitoloPagina";

export const metadata: Metadata = { title: "Report e tempo" };

export default function ReportPage() {
  return (
    <>
      <TitoloPagina titolo="Report e tempo" />
      <Prossimamente testo="Qui vedrai le ore registrate e il riepilogo delle attività per persona e per progetto. Servono prima il registro delle ore e le date di chiusura." />
    </>
  );
}
