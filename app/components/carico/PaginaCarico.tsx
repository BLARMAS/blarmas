"use client";

import { useState } from "react";
import type { Attivita } from "../../lib/tipi";
import { useSessione } from "../SessioneContext";
import TitoloPagina from "../ui/TitoloPagina";
import TabellaCarico from "./TabellaCarico";

// Pagina "Carico di lavoro": quanto è impegnata ogni persona, su tutti i progetti o su uno solo
export default function PaginaCarico({ attivita, oggi }: { attivita: Attivita[]; oggi: string }) {
  const { progetti } = useSessione();
  const [progetto, setProgetto] = useState(""); // "" = tutti i progetti
  const visibili = progetto ? attivita.filter((a) => a.progettoId === progetto) : attivita;

  return (
    <>
      <TitoloPagina
        titolo="Carico di lavoro"
        sotto="Quanto sono impegnate le persone del team, in base alle ore restanti delle attività aperte."
      />
      <div className="mb-4">
        <label htmlFor="progetto-carico" className="block text-sm font-semibold">
          Progetto
        </label>
        <select
          id="progetto-carico"
          value={progetto}
          onChange={(e) => setProgetto(e.target.value)}
          className="mt-1.5 h-11 rounded-lg border border-bordo-campo bg-superficie px-3 text-sm font-medium"
        >
          <option value="">Tutti i progetti</option>
          {progetti.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>
      <TabellaCarico attivita={visibili} oggi={oggi} />
    </>
  );
}
