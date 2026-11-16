"use client";

import { useEffect, useRef, useState } from "react";
import { FinestraNuovaAttivita } from "../progetti/NuovaAttivita";
import { FinestraNuovoProgetto } from "../progetti/NuovoProgetto";
import { FinestraInvito } from "../team/InvitaPersone";
import { useRuoli } from "../SessioneContext";

type Finestra = "progetto" | "attivita" | "invito";

const tutteLeVoci: { finestra: Finestra; nome: string; soloAdmin?: boolean }[] = [
  { finestra: "progetto", nome: "Nuovo progetto" },
  { finestra: "attivita", nome: "Nuova attività" },
  { finestra: "invito", nome: "Invita persone", soloAdmin: true },
];

// Bottone "+ Nuovo" nella barra in alto: apre un menu per creare al volo, da qualsiasi pagina
export default function MenuNuovo() {
  const { puoScrivere, eAdmin } = useRuoli();
  // L'ospite può solo guardare; gli inviti li fa solo l'admin
  const voci = tutteLeVoci.filter((v) => (v.soloAdmin ? eAdmin : puoScrivere));
  const [aperto, setAperto] = useState(false);
  const [finestra, setFinestra] = useState<Finestra | null>(null);
  const riquadroRef = useRef<HTMLDivElement>(null);
  const bottoneRef = useRef<HTMLButtonElement>(null);

  // Il menu si chiude con Esc oppure cliccando fuori
  useEffect(() => {
    if (!aperto) return;
    const conEsc = (e: KeyboardEvent) => e.key === "Escape" && setAperto(false);
    const conClic = (e: MouseEvent) => {
      if (!riquadroRef.current?.contains(e.target as Node)) setAperto(false);
    };
    window.addEventListener("keydown", conEsc);
    document.addEventListener("mousedown", conClic);
    return () => {
      window.removeEventListener("keydown", conEsc);
      document.removeEventListener("mousedown", conClic);
    };
  }, [aperto]);

  // Chiusa la finestra, il focus torna al bottone "+ Nuovo" (la voce del menu non esiste più)
  function chiudiFinestra() {
    setFinestra(null);
    bottoneRef.current?.focus();
  }

  if (voci.length === 0) return null;

  return (
    <div ref={riquadroRef} className="relative">
      <button
        ref={bottoneRef}
        type="button"
        aria-expanded={aperto}
        aria-haspopup="true"
        onClick={() => setAperto(!aperto)}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-admin hover:bg-primario-chiaro"
      >
        + Nuovo
      </button>

      {aperto && (
        <ul className="absolute top-13 right-0 z-40 w-48 rounded-xl border border-bordo bg-superficie p-1.5 text-testo shadow-lg">
          {voci.map((voce) => (
            <li key={voce.finestra}>
              <button
                type="button"
                onClick={() => {
                  setAperto(false);
                  setFinestra(voce.finestra);
                }}
                className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-[15px] hover:bg-sfondo"
              >
                {voce.nome}
              </button>
            </li>
          ))}
        </ul>
      )}

      {finestra === "progetto" && <FinestraNuovoProgetto onChiudi={chiudiFinestra} />}
      {finestra === "attivita" && <FinestraNuovaAttivita onChiudi={chiudiFinestra} />}
      {finestra === "invito" && <FinestraInvito onChiudi={chiudiFinestra} />}
    </div>
  );
}
