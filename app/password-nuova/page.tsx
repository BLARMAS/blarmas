import type { Metadata } from "next";
import FormNuovaPassword from "../components/accesso/FormNuovaPassword";
import LayoutAccesso from "../components/accesso/LayoutAccesso";

export const metadata: Metadata = { title: "Scegli la nuova password" };

// Ci si arriva dal link dell'email. Il proxy la lascia vedere solo a chi ha fatto il login.
export default function PasswordNuovaPage() {
  return (
    <LayoutAccesso>
      <FormNuovaPassword />
    </LayoutAccesso>
  );
}
