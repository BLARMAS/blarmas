"use client";

import { useEffect, useRef, useState } from "react";

// Bottone con l'elenco delle notifiche che si apre sotto.
// Per ora non c'è ancora nessun sistema di notifiche: l'elenco è sempre vuoto.
export default function Notifiche() {
  const [aperte, setAperte] = useState(false);

  // Serve a sapere dove si trova il riquadro, per capire se un clic è "fuori"
  const riquadroRef = useRef<HTMLDivElement>(null);

  // Si chiude con Esc oppure cliccando fuori dal riquadro
  useEffect(() => {
    if (!aperte) return;
    const conEsc = (e: KeyboardEvent) => e.key === "Escape" && setAperte(false);
    const conClic = (e: MouseEvent) => {
      if (!riquadroRef.current?.contains(e.target as Node)) setAperte(false);
    };
    window.addEventListener("keydown", conEsc);
    document.addEventListener("mousedown", conClic);
    return () => {
      window.removeEventListener("keydown", conEsc);
      document.removeEventListener("mousedown", conClic);
    };
  }, [aperte]);

  return (
    <div ref={riquadroRef} className="relative">
      <button
        type="button"
        aria-label="Notifiche, nessuna nuova"
        aria-expanded={aperte}
        onClick={() => setAperte(!aperte)}
        className="flex h-11 min-w-11 items-center justify-center rounded-lg bg-admin-campo px-3 text-sm font-semibold text-white hover:bg-admin-bordo"
      >
        0
      </button>

      {aperte && (
        <div className="absolute top-13 right-0 z-40 w-[320px] max-w-[calc(100vw-2rem)] rounded-xl border border-bordo bg-superficie p-4 text-testo shadow-lg">
          <h2 className="font-bold">Notifiche</h2>
          <p className="mt-2 text-sm text-testo-sec">Nessuna notifica. Le novità compariranno qui.</p>
        </div>
      )}
    </div>
  );
}
