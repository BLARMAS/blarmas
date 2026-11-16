import type { Metadata } from "next";
import Link from "next/link";
import FormAccesso from "./components/accesso/FormAccesso";
import LayoutAccesso from "./components/accesso/LayoutAccesso";

export const metadata: Metadata = {
  title: "Accedi",
};

// Pagina di accesso: è la home del sito ("/").
// Il modulo controlla i campi; il login vero arriva con Supabase (passo 4).
export default function AccessoPage() {
  return (
    <LayoutAccesso>
      <h1 className="text-[28px] font-bold">Accedi</h1>

      <FormAccesso />

      <p className="mt-5 text-[15px] text-testo-sec">
        Non hai un account?{" "}
        <Link href="/crea-organizzazione" className="font-semibold text-primario">
          Crea la tua organizzazione
        </Link>
      </p>
    </LayoutAccesso>
  );
}
