"use client";

import { useState } from "react";
import Bottone from "./Bottone";
import Finestra from "./Finestra";

type Props = {
  titolo: string;
  testo: string;
  etichettaConferma: string; // es. "Elimina"
  // Esegue l'azione. Restituisce il messaggio di errore, oppure null se è andata bene.
  onConferma: () => Promise<string | null>;
  onChiudi: () => void;
};

// Finestra per chiedere conferma prima di un'azione che non si può annullare (es. eliminare)
export default function FinestraConferma({ titolo, testo, etichettaConferma, onConferma, onChiudi }: Props) {
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);

  return (
    <Finestra titolo={titolo} onChiudi={onChiudi}>
      <p className="text-[15px] text-testo-sec">{testo}</p>
      <p role="alert" className="mt-3 text-sm text-errore">
        {errore}
      </p>
      <div className="mt-4 flex justify-end gap-2">
        {/* "Annulla" è il primo bottone: è quello che riceve il focus all'apertura */}
        <Bottone variante="neutro" onClick={onChiudi}>
          Annulla
        </Bottone>
        <Bottone
          variante="pericolo"
          onClick={async () => {
            if (inCorso) return;
            setInCorso(true);
            setErrore("");
            const messaggio = await onConferma();
            if (messaggio) {
              setInCorso(false);
              setErrore(messaggio);
            }
          }}
        >
          {inCorso ? "Attendi…" : etichettaConferma}
        </Bottone>
      </div>
    </Finestra>
  );
}
