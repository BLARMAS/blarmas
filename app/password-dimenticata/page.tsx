import type { Metadata } from "next";
import { Suspense } from "react";
import FormRecuperoPassword from "../components/accesso/FormRecuperoPassword";
import LayoutAccesso from "../components/accesso/LayoutAccesso";

export const metadata: Metadata = { title: "Recupera la password" };

// Fuori dal gruppo (app): niente barra admin né sidebar, come il login
export default function PasswordDimenticataPage() {
  return (
    <LayoutAccesso>
      {/* Suspense: il modulo legge l'indirizzo (useSearchParams), che arriva solo al momento della visita */}
      <Suspense>
        <FormRecuperoPassword />
      </Suspense>
    </LayoutAccesso>
  );
}
