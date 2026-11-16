"use client";

import { useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";
import Bottone from "../ui/Bottone";
import Campo from "../ui/Campo";

// Cambio password (chi è collegato può sceglierne una nuova)
export default function FormPassword() {
  const [messaggio, setMessaggio] = useState<{ testo: string; errore: boolean } | null>(null);
  const [inCorso, setInCorso] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const modulo = e.currentTarget;
        const dati = new FormData(modulo);
        const nuova = String(dati.get("nuova"));
        if (nuova.length < 8) {
          setMessaggio({ testo: "La password deve avere almeno 8 caratteri.", errore: true });
          return;
        }
        if (nuova !== dati.get("conferma")) {
          setMessaggio({ testo: "Le due password non coincidono.", errore: true });
          return;
        }
        setMessaggio(null);
        setInCorso(true);
        const { error } = await creaClientBrowser().auth.updateUser({ password: nuova });
        setInCorso(false);
        if (error) {
          setMessaggio({ testo: "Non è stato possibile cambiare la password. Riprova.", errore: true });
          return;
        }
        modulo.reset(); // svuota i campi: la password non resta scritta sullo schermo
        setMessaggio({ testo: "Password aggiornata.", errore: false });
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="nuova" etichetta="Nuova password" tipo="password" autoComplete="new-password" obbligatorio />
        <Campo id="conferma" etichetta="Conferma nuova password" tipo="password" autoComplete="new-password" obbligatorio />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Bottone tipo="submit">{inCorso ? "Salvataggio…" : "Cambia password"}</Bottone>
        <p role="status" className={`text-sm ${messaggio?.errore ? "text-errore" : "text-successo"}`}>
          {messaggio?.testo}
        </p>
      </div>
    </form>
  );
}
