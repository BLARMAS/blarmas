"use client";

import { useEffect, useRef } from "react";

type FinestraProps = {
  titolo: string;
  onChiudi: () => void;
  children: React.ReactNode;
};

// Finestra al centro dello schermo (per i moduli "Nuovo ...")
export default function Finestra({ titolo, onChiudi, children }: FinestraProps) {
  const riquadroRef = useRef<HTMLDivElement>(null);

  // All'apertura il focus va sul primo campo; alla chiusura torna al bottone che l'ha aperta
  useEffect(() => {
    const aperta = document.activeElement as HTMLElement | null;
    // Il primo campo; se non ce ne sono (finestre di conferma) il primo bottone del contenuto, che è "Annulla"
    const contenuto = riquadroRef.current?.querySelector<HTMLElement>("[data-contenuto]");
    const primo = contenuto?.querySelector<HTMLElement>("input, select, textarea") ?? contenuto?.querySelector<HTMLElement>("button");
    primo?.focus();
    return () => aperta?.focus();
  }, []);

  // Con Esc la finestra si chiude
  useEffect(() => {
    const conEsc = (e: KeyboardEvent) => e.key === "Escape" && onChiudi();
    window.addEventListener("keydown", conEsc);
    return () => window.removeEventListener("keydown", conEsc);
  }, [onChiudi]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Sfondo scuro: un clic fuori dalla finestra la chiude */}
      <button type="button" aria-label="Chiudi la finestra" tabIndex={-1} onClick={onChiudi} className="absolute inset-0 bg-black/40" />

      <div
        ref={riquadroRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titolo-finestra"
        className="relative max-h-full w-full max-w-[480px] overflow-y-auto rounded-xl bg-superficie p-6 text-testo shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="titolo-finestra" className="text-[22px] leading-tight font-bold">
            {titolo}
          </h2>
          <button
            type="button"
            onClick={onChiudi}
            aria-label="Chiudi"
            className="-mt-1.5 -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl text-testo-sec hover:bg-sfondo"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <div data-contenuto>{children}</div>
      </div>
    </div>
  );
}
