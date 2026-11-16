"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";

const linkIndietro = "mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-primario";

// Richiesta del link per scegliere una nuova password.
// Supabase spedisce l'email con il link; il link porta a /auth/conferma e poi a /password-nuova.
export default function FormRecuperoPassword() {
  const [inviata, setInviata] = useState(false);
  const [inCorso, setInCorso] = useState(false); // true mentre aspettiamo Supabase
  const [errore, setErrore] = useState("");
  // Se si arriva da un link scaduto o già usato, /auth/conferma ci rimanda qui con ?link=scaduto
  const linkScaduto = useSearchParams().get("link") === "scaduto";

  // Dopo l'invio il modulo lascia il posto a un messaggio di conferma
  if (inviata) {
    return (
      <div role="status">
        <h1 className="text-[28px] font-bold">Controlla la tua email</h1>
        {/* Il messaggio non dice se l'indirizzo esiste: così nessuno può scoprire chi ha un account */}
        <p className="mt-3 text-[15px] text-testo-sec">
          Se l&apos;indirizzo è registrato, riceverai un link per scegliere una nuova password.
        </p>
        <Link href="/" className={linkIndietro}>
          ← Torna all&apos;accesso
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-[28px] font-bold">Recupera la password</h1>
      <p className="mt-2 text-[15px] text-testo-sec">
        Inserisci la tua email di lavoro: ti invieremo un link per scegliere una nuova password.
      </p>
      {linkScaduto && (
        <p role="alert" className="mt-3 text-sm text-errore">
          Il link non è più valido (è scaduto, già usato, o aperto da un altro browser). Richiedine uno nuovo.
        </p>
      )}

      <form
        onSubmit={async (e) => {
          e.preventDefault(); // evita che la pagina si ricarichi
          const email = String(new FormData(e.currentTarget).get("email")).trim();
          setInCorso(true);
          setErrore("");
          const { error } = await creaClientBrowser().auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/conferma`,
          });
          setInCorso(false);
          // Se l'indirizzo non esiste Supabase non dà errore: il messaggio resta uguale per tutti.
          // Un errore qui vuol dire altro (troppe richieste, rete...).
          if (error) {
            setErrore("Non è stato possibile inviare l'email. Riprova tra qualche minuto.");
            return;
          }
          setInviata(true);
        }}
        className="mt-5"
      >
        <label htmlFor="email" className="text-sm font-semibold">
          Email di lavoro
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="nome@azienda.it"
          className="mt-1.5 h-[46px] w-full rounded-lg border border-bordo-campo bg-superficie px-3 text-[15px] placeholder:text-testo-sec"
        />
        {/* role="alert": gli screen reader leggono subito l'errore quando compare */}
        <p role="alert" className="mt-2 text-sm text-errore">
          {errore}
        </p>
        <button
          type="submit"
          disabled={inCorso}
          className="mt-2 flex h-12 w-full items-center justify-center rounded-lg bg-primario font-semibold text-white hover:bg-primario-scuro disabled:opacity-70"
        >
          {inCorso ? "Invio in corso…" : "Invia link"}
        </button>
      </form>

      <Link href="/" className={linkIndietro}>
        ← Torna all&apos;accesso
      </Link>
    </>
  );
}
