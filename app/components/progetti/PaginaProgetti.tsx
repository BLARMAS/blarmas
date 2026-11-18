import Link from "next/link";
import { formattaData } from "../../lib/date";
import { formattaEffort, formattaOre, type Progetto, type StatoProgetto } from "../../lib/tipi";
import Badge from "../ui/Badge";
import BarraProgresso from "../ui/BarraProgresso";
import Statistica from "../ui/Statistica";
import TitoloPagina from "../ui/TitoloPagina";
import NuovoProgetto from "./NuovoProgetto";

const tonoStato = { "In corso": "primario", "A rischio": "attenzione", Completato: "successo" } as const;
const coloreBarra: Record<StatoProgetto, string> = {
  "In corso": "bg-primario",
  "A rischio": "bg-attenzione-barra",
  Completato: "bg-successo",
};

type Props = {
  progetti: Progetto[];
  inScadenza: number; // attività aperte che scadono entro 7 giorni
  completate: number;
};

// Contenuto della pagina Progetti (i dati arrivano dal server)
export default function PaginaProgetti({ progetti, inScadenza, completate }: Props) {
  const attivi = progetti.filter((p) => p.stato !== "Completato").length;

  return (
    <>
      <TitoloPagina titolo="Progetti" azione={<NuovoProgetto />} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Statistica etichetta="Progetti attivi" valore={String(attivi)} />
        <Statistica etichetta="Attività in scadenza (7 giorni)" valore={String(inScadenza)} />
        <Statistica etichetta="Attività completate" valore={String(completate)} />
      </div>

      {progetti.length === 0 ? (
        <p className="mt-5 rounded-xl border border-bordo bg-superficie p-5 text-testo-sec">
          Non ci sono ancora progetti. Crea il primo con il bottone &quot;Nuovo progetto&quot;.
        </p>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {progetti.map((p) => (
            // Tutta la card è cliccabile grazie al link che si allarga (after:absolute)
            <li key={p.id} className="relative rounded-xl border border-bordo bg-superficie p-5 hover:border-primario">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">
                  <Link href={`/progetti/${p.id}`} className="after:absolute after:inset-0 after:rounded-xl">
                    {p.nome}
                  </Link>
                </h2>
                <Badge testo={p.stato} tono={tonoStato[p.stato]} />
              </div>
              <div className="mt-3">
                <BarraProgresso percentuale={p.avanzamento} colore={coloreBarra[p.stato]} etichetta={`Avanzamento ${p.nome}`} />
              </div>
              <p className="mt-2 flex justify-between text-sm text-testo-sec">
                <span>{p.avanzamento}% completato</span>
                <span>
                  {p.inizio && p.scadenza
                    ? `Dal ${formattaData(p.inizio)} al ${formattaData(p.scadenza)}`
                    : p.scadenza
                      ? `Scadenza ${formattaData(p.scadenza)}`
                      : "Senza scadenza"}
                </span>
              </p>
              {p.ore !== null && p.oreRestanti !== null && (
                <p className="mt-1 text-sm text-testo-sec">
                  Restano {formattaOre(p.oreRestanti)} su {formattaEffort(p.ore)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

