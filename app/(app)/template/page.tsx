import type { Metadata } from "next";
import Prossimamente from "../../components/ui/Prossimamente";
import TitoloPagina from "../../components/ui/TitoloPagina";

export const metadata: Metadata = { title: "Template" };

export default function TemplatePage() {
  return (
    <>
      <TitoloPagina titolo="Template di progetto" sotto="Parti da una struttura già pronta di attività e colonne." />
      <Prossimamente testo="Potrai creare un nuovo progetto partendo da un modello già pronto, o salvare un tuo progetto come modello." />
    </>
  );
}
