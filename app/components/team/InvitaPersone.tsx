"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";
import { useRuoli, useSessione } from "../SessioneContext";
import Bottone from "../ui/Bottone";
import Campo from "../ui/Campo";
import Finestra from "../ui/Finestra";

const campoSelect = "mt-1.5 h-[46px] w-full rounded-lg border border-bordo-campo bg-superficie px-3 text-[15px]";

// La finestra con il modulo. Per ora l'invito viene solo registrato: l'email vera arriva più avanti.
export function FinestraInvito({ onChiudi: chiudi }: { onChiudi: () => void }) {
  const router = useRouter();
  const { organizzazioneId } = useSessione();
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);

  return (
    <Finestra titolo="Invita persone" onChiudi={chiudi}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const dati = new FormData(e.currentTarget);
          setErrore("");
          setInCorso(true);
          const { error } = await creaClientBrowser()
            .from("membri")
            .insert({
              organizzazione_id: organizzazioneId,
              email: String(dati.get("invito-email")).trim(),
              ruolo: String(dati.get("invito-ruolo")),
              stato: "invitato",
            });
          setInCorso(false);
          if (error) {
            // 23505 = esiste già una riga uguale (stessa email nella stessa organizzazione)
            setErrore(
              error.code === "23505"
                ? "Questa persona è già nel team."
                : "Non è stato possibile registrare l'invito. Riprova.",
            );
            return;
          }
          router.refresh(); // rilegge i dati dal server: la persona compare nell'elenco
          chiudi();
        }}
        className="space-y-4"
      >
        <Campo id="invito-email" etichetta="Email" tipo="email" suggerimento="nome@azienda.it" obbligatorio />
        <div>
          <label htmlFor="invito-ruolo" className="text-sm font-semibold">
            Ruolo
          </label>
          <select id="invito-ruolo" name="invito-ruolo" defaultValue="membro" className={campoSelect}>
            <option value="membro">Membro</option>
            <option value="ospite">Ospite</option>
          </select>
        </div>
        <p role="alert" className="text-sm text-errore">
          {errore}
        </p>
        <div className="flex justify-end gap-2">
          <Bottone variante="neutro" onClick={chiudi}>
            Annulla
          </Bottone>
          <Bottone tipo="submit">{inCorso ? "Invio…" : "Invia invito"}</Bottone>
        </div>
      </form>
    </Finestra>
  );
}

// Bottone "Invita persone" che apre la finestra (lo vede solo l'admin)
export default function InvitaPersone() {
  const [aperta, setAperta] = useState(false);
  const { eAdmin } = useRuoli();
  if (!eAdmin) return null;

  return (
    <>
      <Bottone onClick={() => setAperta(true)}>Invita persone</Bottone>
      {aperta && <FinestraInvito onChiudi={() => setAperta(false)} />}
    </>
  );
}
