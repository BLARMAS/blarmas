"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";
import Bottone from "../ui/Bottone";
import Campo from "../ui/Campo";

// Scelta della nuova password, dopo aver cliccato il link dell'email.
export default function FormNuovaPassword() {
  const router = useRouter();
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);

  return (
    <>
      <h1 className="text-[28px] font-bold">Scegli la nuova password</h1>
      <p className="mt-2 text-[15px] text-testo-sec">Usa almeno 8 caratteri.</p>

      <form
        onSubmit={async (e) => {
          e.preventDefault(); // evita che la pagina si ricarichi
          const dati = new FormData(e.currentTarget);
          const password = String(dati.get("password"));
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
          const { error } = await creaClientBrowser().auth.updateUser({ password });
          if (error) {
            setInCorso(false);
            setErrore("Non è stato possibile cambiare la password. Riprova, o richiedi un nuovo link.");
            return;
          }
          router.push("/home");
          router.refresh();
        }}
        className="mt-5 space-y-4"
      >
        <Campo id="password" etichetta="Nuova password" tipo="password" autoComplete="new-password" obbligatorio />
        <Campo id="conferma" etichetta="Conferma password" tipo="password" autoComplete="new-password" obbligatorio />
        {/* role="alert": gli screen reader leggono subito l'errore quando compare */}
        <p role="alert" className="text-sm text-errore">
          {errore}
        </p>
        <Bottone tipo="submit" className="h-12 w-full">
          {inCorso ? "Salvataggio…" : "Salva la password"}
        </Bottone>
      </form>
    </>
  );
}
