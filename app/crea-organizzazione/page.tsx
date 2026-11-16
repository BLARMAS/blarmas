import type { Metadata } from "next";
import FormCreaOrganizzazione from "../components/accesso/FormCreaOrganizzazione";
import LayoutAccesso from "../components/accesso/LayoutAccesso";

export const metadata: Metadata = { title: "Crea la tua organizzazione" };

// Fuori dal gruppo (app): niente barra admin né sidebar, come il login
export default function CreaOrganizzazionePage() {
  return (
    <LayoutAccesso>
      <FormCreaOrganizzazione />
    </LayoutAccesso>
  );
}
