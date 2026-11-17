"use client";

import { useState } from "react";
import { formattaNumero, giorniInOre, oreInGiorni, ORE_PER_GIORNO } from "../../lib/tipi";

type Unita = "gg" | "h";

type Props = {
  id: string; // il valore (sempre in ore) viaggia nel modulo con questo nome
  etichetta: string;
  oreIniziali?: number | null;
  onCambia?: (ore: number | null) => void; // avvisa chi sta sopra quando il valore (in ore) cambia
};

const arrotonda = (n: number) => Math.round(n * 100) / 100;

// Campo unico per l'effort: si scrive in giorni (gg, predefinito) oppure in ore (h),
// con un interruttore per cambiare unità. Il valore è sempre modificabile e l'altra unità
// si calcola da sola (1 giorno = 8 ore). Nel modulo parte il valore in ORE, senza arrotondamenti.
export default function CampoEffort({ id, etichetta, oreIniziali = null, onCambia }: Props) {
  const [unita, setUnita] = useState<Unita>("gg");
  const [ore, setOre] = useState<number | null>(oreIniziali); // il valore vero, in ore
  const mostra = (o: number | null, u: Unita) => (o === null ? "" : String(arrotonda(u === "gg" ? oreInGiorni(o) : o)));
  const [testo, setTesto] = useState(mostra(oreIniziali, "gg")); // ciò che si vede scritto nel campo

  function cambiaTesto(valore: string) {
    setTesto(valore);
    const n = valore === "" ? null : Number(valore);
    const nuoveOre = n === null || Number.isNaN(n) || n < 0 ? null : arrotonda(unita === "gg" ? giorniInOre(n) : n);
    setOre(nuoveOre);
    onCambia?.(nuoveOre);
  }

  function cambiaUnita(nuova: Unita) {
    setUnita(nuova);
    setTesto(mostra(ore, nuova)); // lo stesso effort, scritto nell'altra unità
  }

  const bottone = (u: Unita, nome: string) => (
    <button
      type="button"
      aria-pressed={unita === u}
      onClick={() => cambiaUnita(u)}
      className={`min-h-[38px] min-w-11 rounded-md px-3 text-sm font-semibold ${
        unita === u ? "bg-superficie text-testo shadow-sm" : "text-testo-sec"
      }`}
    >
      {nome}
      <span className="sr-only">{u === "gg" ? " (giorni)" : " (ore)"}</span>
    </button>
  );

  return (
    <div>
      <label htmlFor={`${id}-valore`} className="text-sm font-semibold">
        {etichetta}
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id={`${id}-valore`}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={testo}
          onChange={(e) => cambiaTesto(e.target.value)}
          aria-describedby={`${id}-equivalente`}
          className="h-[46px] min-w-0 flex-1 rounded-lg border border-bordo-campo bg-superficie px-3 text-[15px]"
        />
        <div className="flex gap-1 rounded-lg bg-colonna p-1" role="group" aria-label="Unità di misura">
          {bottone("gg", "gg")}
          {bottone("h", "h")}
        </div>
      </div>
      {/* L'altra unità, calcolata (1 giorno = 8 ore). Il valore vero viaggia nel campo nascosto */}
      <p id={`${id}-equivalente`} aria-live="polite" className="mt-1 text-xs text-testo-sec">
        {ore === null
          ? `1 giorno = ${ORE_PER_GIORNO} ore`
          : unita === "gg"
            ? `= ${formattaNumero(ore)} h`
            : `= ${formattaNumero(oreInGiorni(ore))} gg`}
      </p>
      <input type="hidden" name={id} value={ore ?? ""} />
    </div>
  );
}
