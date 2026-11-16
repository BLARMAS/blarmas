"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";
import Bottone from "../ui/Bottone";
import Campo from "../ui/Campo";

// Dati personali: si può cambiare il nome. L'email è quella dell'accesso e per ora non si modifica.
export default function FormProfilo({ nome, email }: { nome: string; email: string }) {
  const router = useRouter();
  const [messaggio, setMessaggio] = useState<{ testo: string; errore: boolean } | null>(null);
  const [inCorso, setInCorso] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const nuovoNome = String(new FormData(e.currentTarget).get("nome")).trim();
        setMessaggio(null);
        setInCorso(true);
        // La funzione del database cambia solo il tuo nome (non ruolo né stato)
        const { error } = await creaClientBrowser().rpc("aggiorna_mio_nome", { nuovo_nome: nuovoNome });
        setInCorso(false);
        if (error) {
          setMessaggio({ testo: "Non è stato possibile salvare. Riprova.", errore: true });
          return;
        }
        setMessaggio({ testo: "Modifiche salvate.", errore: false });
        router.refresh(); // rilegge i dati dal server: il nome si aggiorna in alto
      }}
      className="space-y-4"
    >
      <Campo id="nome" etichetta="Nome e cognome" valoreIniziale={nome === email ? "" : nome} autoComplete="name" />
      <div>
        <label htmlFor="email" className="text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          aria-describedby="aiuto-email"
          className="mt-1.5 h-[46px] w-full rounded-lg border border-bordo-campo bg-sfondo px-3 text-[15px] text-testo-sec"
        />
        <p id="aiuto-email" className="mt-1 text-xs text-testo-sec">
          È l&apos;email che usi per accedere.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Bottone tipo="submit">{inCorso ? "Salvataggio…" : "Salva modifiche"}</Bottone>
        {/* role="status": gli screen reader leggono il messaggio quando compare */}
        <p role="status" className={`text-sm ${messaggio?.errore ? "text-errore" : "text-successo"}`}>
          {messaggio?.testo}
        </p>
      </div>
    </form>
  );
}
