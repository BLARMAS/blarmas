"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";

const campo =
  "h-[46px] w-full rounded-lg border border-bordo-campo bg-superficie px-3 text-[15px] placeholder:text-testo-sec";

// Controlla un'email in modo semplice: qualcosa@dominio.estensione
const emailValida = (testo: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(testo);

type Errori = { email?: string; password?: string; generale?: string };

// Modulo di accesso: controlla i campi e poi chiede a Supabase di verificare email e password.
export default function FormAccesso() {
  const router = useRouter();
  const [errori, setErrori] = useState<Errori>({});
  const [inCorso, setInCorso] = useState(false); // true mentre aspettiamo Supabase

  return (
    // noValidate: i messaggi li scriviamo noi, in italiano, sotto ai campi
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault(); // evita che la pagina si ricarichi (e che la password finisca nell'indirizzo)
        const dati = new FormData(e.currentTarget);
        const email = String(dati.get("email")).trim();
        const password = String(dati.get("password"));

        const nuovi: Errori = {};
        if (!email) nuovi.email = "Inserisci la tua email.";
        else if (!emailValida(email)) nuovi.email = "Inserisci un'email valida, ad esempio nome@azienda.it.";
        if (!password) nuovi.password = "Inserisci la password.";

        setErrori(nuovi);
        if (Object.keys(nuovi).length > 0) return;

        setInCorso(true);
        const { error } = await creaClientBrowser().auth.signInWithPassword({ email, password });
        if (error) {
          setInCorso(false);
          // Messaggio uguale per email e password sbagliate: non si scopre chi ha un account
          setErrori({ generale: "Email o password non corretti." });
          return;
        }
        router.push("/home");
        router.refresh(); // fa rileggere al server chi ha fatto il login
      }}
      className="mt-5"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-semibold">
            Email di lavoro
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nome@azienda.it"
            aria-invalid={!!errori.email}
            aria-describedby={errori.email ? "errore-email" : undefined}
            className={`${campo} mt-1.5`}
          />
          {/* role="alert": gli screen reader leggono subito l'errore quando compare */}
          {errori.email && (
            <p id="errore-email" role="alert" className="mt-1.5 text-sm text-errore">
              {errori.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-semibold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            aria-invalid={!!errori.password}
            aria-describedby={errori.password ? "errore-password" : undefined}
            className={`${campo} mt-1.5`}
          />
          {errori.password && (
            <p id="errore-password" role="alert" className="mt-1.5 text-sm text-errore">
              {errori.password}
            </p>
          )}
        </div>
      </div>

      <Link href="/password-dimenticata" className="mt-4 inline-flex min-h-11 items-center text-sm text-primario">
        Password dimenticata?
      </Link>

      {errori.generale && (
        <p role="alert" className="mt-1 text-sm text-errore">
          {errori.generale}
        </p>
      )}

      <button
        type="submit"
        disabled={inCorso}
        className="mt-1 flex h-12 w-full items-center justify-center rounded-lg bg-primario font-semibold text-white hover:bg-primario-scuro disabled:opacity-70"
      >
        {inCorso ? "Accesso in corso…" : "Accedi"}
      </button>
    </form>
  );
}
