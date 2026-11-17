"use client";

import { useState } from "react";
import { formattaOre, oreRestantiAttivita, stati, type Attivita, type Stato } from "../../lib/tipi";
import { formattaData } from "../../lib/date";

type BachecaProps = {
  attivita: Attivita[];
  onApri: (id: string) => void;
  onSposta: (id: string, stato: Stato) => void;
  puoSpostare: boolean; // l'ospite può solo guardare
};

// Bacheca Kanban: tre colonne; le card si trascinano da una colonna all'altra
export default function Bacheca({ attivita, onApri, onSposta, puoSpostare }: BachecaProps) {
  const [trascinata, setTrascinata] = useState<string | null>(null);
  const [colonnaSopra, setColonnaSopra] = useState<Stato | null>(null);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stati.map((stato) => {
        const delleColonna = attivita.filter((a) => a.stato === stato);
        return (
          <section
            key={stato}
            aria-labelledby={`colonna-${stato}`}
            // Le card si possono "lasciare" qui sopra
            onDragOver={(e) => {
              e.preventDefault();
              setColonnaSopra(stato);
            }}
            onDragLeave={() => setColonnaSopra(null)}
            onDrop={() => {
              if (trascinata !== null) {
                // Se la card è già in questa colonna non serve salvare niente
                const card = attivita.find((a) => a.id === trascinata);
                if (card && card.stato !== stato) onSposta(trascinata, stato);
              }
              setTrascinata(null);
              setColonnaSopra(null);
            }}
            className={`rounded-xl bg-colonna p-2 ${colonnaSopra === stato ? "outline-2 outline-primario" : ""}`}
          >
            <div className="flex items-center justify-between px-2.5 py-2 text-[15px] font-bold">
              <h2 id={`colonna-${stato}`}>{stato}</h2>
              <span className="text-testo-sec">{delleColonna.length}</span>
            </div>
            <ul className="min-h-12 space-y-2.5">
              {delleColonna.map((a) => (
                <li
                  key={a.id}
                  draggable={puoSpostare}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", a.id);
                    setTrascinata(a.id);
                  }}
                  onDragEnd={() => {
                    setTrascinata(null);
                    setColonnaSopra(null);
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onApri(a.id)}
                    className={`w-full ${puoSpostare ? "cursor-grab" : ""} rounded-lg border border-bordo bg-superficie p-3.5 text-left hover:border-primario`}
                  >
                    <span className="block text-[15px]">{a.titolo}</span>
                    <span className="mt-1 block text-[13px] text-testo-sec">
                      {a.stato === "Fatto" ? "Chiusa" : "Scadenza"} {formattaData(a.scadenza)} · {a.assegnatario}
                    </span>
                    {a.ore !== null && a.stato !== "Fatto" && (
                      <span className="mt-1 block text-[13px] font-semibold text-primario">
                        Restano {formattaOre(oreRestantiAttivita(a) ?? 0)} su {formattaOre(a.ore)}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
