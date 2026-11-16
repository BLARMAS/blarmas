import { Suspense } from "react";
import ShellApp from "../components/layout/ShellApp";
import BottoneEsci from "../components/layout/BottoneEsci";
import FormNuovaOrganizzazione from "../components/layout/FormNuovaOrganizzazione";
import { caricaSessione } from "../lib/db";

// Vale per tutte le pagine dentro (app): hanno barra admin e sidebar.
// Il login ("/") è fuori da questa cartella e quindi non le ha.
// Suspense: mentre il server legge chi sei dal database si vede "Caricamento…".
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-testo-sec">Caricamento…</p>}>
      <ConSessione>{children}</ConSessione>
    </Suspense>
  );
}

async function ConSessione({ children }: { children: React.ReactNode }) {
  const sessione = await caricaSessione();

  // Il proxy fa entrare solo chi è loggato: senza sessione qui vuol dire che non ha nessuna organizzazione
  if (!sessione) {
    return (
      <main className="mx-auto max-w-[520px] p-8">
        <h1 className="text-[28px] font-bold">Crea la tua organizzazione</h1>
        <p className="mt-2 text-[15px] text-testo-sec">
          Il tuo account non fa ancora parte di nessuna organizzazione. Creane una: ne sarai l&apos;amministratore e
          potrai invitare il tuo team. Se invece ti hanno invitato, chiedi all&apos;amministratore di controllare il
          tuo indirizzo email.
        </p>
        <FormNuovaOrganizzazione />
        <div className="mt-5">
          <BottoneEsci />
        </div>
      </main>
    );
  }

  return <ShellApp sessione={sessione}>{children}</ShellApp>;
}
