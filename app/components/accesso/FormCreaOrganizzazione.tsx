"use client";

import Link from "next/link";
import { useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";
import Bottone from "../ui/Bottone";
import Campo from "../ui/Campo";

const linkIndietro = "mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-primario";

// Creazione di una nuova organizzazione. Chi la crea ne diventa l'admin.
// Registra l'utente su Supabase e poi crea l'organizzazione con la funzione crea_organizzazione.
export default function FormCreaOrganizzazione() {
  const [errore, setErrore] = useState("");
  const [creata, setCreata] = useState<string | null>(null); // nome dell'organizzazione creata
  const [inCorso, setInCorso] = useState(false); // true mentre aspettiamo Supabase
  const [daConfermare, setDaConfermare] = useState(false); // true se Supabase vuole la conferma via email

  // Se Supabase chiede di confermare l'email, l'organizzazione si crea al primo accesso
  if (daConfermare) {
    return (
      <div role="status">
        <h1 className="text-[28px] font-bold">Controlla la tua email</h1>
        <p className="mt-3 text-[15px] text-testo-sec">
          Ti abbiamo scritto un link per confermare l&apos;indirizzo. Dopo la conferma potrai accedere.
        </p>
        <Link href="/" className={linkIndietro}>
          ← Torna all&apos;accesso
        </Link>
      </div>
    );
  }

  // Dopo l'invio il modulo lascia il posto a un messaggio di conferma
  if (creata) {
    return (
      <div role="status">
        <h1 className="text-[28px] font-bold">Organizzazione creata</h1>
        <p className="mt-3 text-[15px] text-testo-sec">
          <strong className="text-testo">{creata}</strong> è pronta. Sei l&apos;amministratore: potrai invitare le
          persone del tuo team.
        </p>
        <Bottone href="/home" className="mt-5 h-12 w-full">
          Vai a Blarmas
        </Bottone>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-[28px] font-bold">Crea la tua organizzazione</h1>
      <p className="mt-2 text-[15px] text-testo-sec">
        Sarai l&apos;amministratore e potrai invitare il tuo team.
      </p>

      <form
        onSubmit={async (e) => {
          e.preventDefault(); // evita che la pagina si ricarichi
          const dati = new FormData(e.currentTarget);
          const password = String(dati.get("password"));
          const organizzazione = String(dati.get("organizzazione")).trim();
          if (password.length < 8) {
            setErrore("La password deve avere almeno 8 caratteri.");
            return;
          }
          if (password !== dati.get("conferma")) {
            setErrore("Le due password non coincidono.");
            return;
          }
          setErrore("");
          setInCorso(true);

          const supabase = creaClientBrowser();
          const { data, error } = await supabase.auth.signUp({
            email: String(dati.get("email")).trim(),
            password,
          });
          if (error) {
            setInCorso(false);
            setErrore("Non è stato possibile creare l'account. Controlla i dati e riprova.");
            return;
          }
          // Senza sessione vuol dire che Supabase aspetta la conferma dell'email
          if (!data.session) {
            setInCorso(false);
            setDaConfermare(true);
            return;
          }
          const { error: erroreOrg } = await supabase.rpc("crea_organizzazione", {
            nome_organizzazione: organizzazione,
            nome_persona: String(dati.get("nome")).trim(),
          });
          setInCorso(false);
          if (erroreOrg) {
            setErrore("L'account è stato creato, ma non l'organizzazione. Riprova.");
            return;
          }
          setCreata(organizzazione);
        }}
        className="mt-5 space-y-4"
      >
        <Campo id="organizzazione" etichetta="Nome dell'organizzazione" suggerimento="Es. Studio Rossi" obbligatorio />
        <Campo id="nome" etichetta="Il tuo nome e cognome" autoComplete="name" obbligatorio />
        <Campo
          id="email"
          etichetta="Email di lavoro"
          tipo="email"
          autoComplete="email"
          suggerimento="nome@azienda.it"
          obbligatorio
        />
        <Campo id="password" etichetta="Password" tipo="password" autoComplete="new-password" obbligatorio />
        <Campo
          id="conferma"
          etichetta="Conferma password"
          tipo="password"
          autoComplete="new-password"
          obbligatorio
        />

        {/* role="alert": gli screen reader leggono subito l'errore quando compare */}
        <p role="alert" className="text-sm text-errore">
          {errore}
        </p>

        <Bottone tipo="submit" className="h-12 w-full">
          {inCorso ? "Creazione in corso…" : "Crea organizzazione"}
        </Bottone>
      </form>

      <Link href="/" className={linkIndietro}>
        ← Torna all&apos;accesso
      </Link>
    </>
  );
}
