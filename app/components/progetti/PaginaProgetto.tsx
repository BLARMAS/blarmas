import { formattaEffort, type Attivita, type Progetto } from "../../lib/tipi";

// Messaggio sulle ore assegnate alle attività rispetto all'effort del progetto
function avvisoOre(progetto: Progetto) {
  if (progetto.ore === null) return null;
  const differenza = progetto.orePianificate - progetto.ore;
  if (differenza > 0)
    return { superato: true, testo: `Le attività superano l'effort del progetto di ${formattaEffort(differenza)}.` };
  if (differenza === 0 && progetto.ore > 0)
    return { superato: false, testo: "Hai assegnato alle attività tutte le ore del progetto: non ne restano da assegnare." };
  return null;
}
import Bottone from "../ui/Bottone";
import TitoloPagina from "../ui/TitoloPagina";
import AzioniProgetto from "./AzioniProgetto";
import NuovaAttivita from "./NuovaAttivita";
import VistaProgetto from "./VistaProgetto";

// Contenuto della pagina di un progetto (i dati arrivano dal server).
// Se il progetto non esiste, o appartiene a un'altra organizzazione, il database non lo restituisce.
export default function PaginaProgetto({ progetto, attivita }: { progetto: Progetto | undefined; attivita: Attivita[] }) {
  if (!progetto) {
    return (
      <>
        <TitoloPagina titolo="Progetto non trovato" />
        <p className="mb-4 text-testo-sec">Questo progetto non esiste, oppure non hai il permesso di vederlo.</p>
        <Bottone href="/progetti">Torna ai progetti</Bottone>
      </>
    );
  }

  const avviso = avvisoOre(progetto);

  return (
    <>
      <TitoloPagina
        titolo={progetto.nome}
        briciole={{ nome: "Progetti", href: "/progetti" }}
        azione={
          <div className="flex flex-wrap gap-2">
            <AzioniProgetto progetto={progetto} />
            <NuovaAttivita progettoId={progetto.id} />
          </div>
        }
      />
      {progetto.ore !== null && progetto.oreRestanti !== null && (
        <dl className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Effort del progetto", formattaEffort(progetto.ore)],
            ["Assegnato alle attività", formattaEffort(progetto.orePianificate)],
            ["Consumato", formattaEffort(progetto.oreConsumate)],
            ["Restante", formattaEffort(progetto.oreRestanti)],
          ].map(([etichetta, valore]) => (
            <div key={etichetta} className="rounded-xl border border-bordo bg-superficie p-4">
              <dt className="text-sm text-testo-sec">{etichetta}</dt>
              <dd className="text-lg font-bold">{valore}</dd>
            </div>
          ))}
        </dl>
      )}
      {avviso && (
        <p
          role="status"
          className={`mb-5 rounded-lg px-4 py-3 text-[15px] font-semibold ${
            avviso.superato ? "bg-attenzione-sfondo text-attenzione" : "bg-primario-chiaro text-primario"
          }`}
        >
          {avviso.testo}
        </p>
      )}
      <VistaProgetto attivita={attivita} />
    </>
  );
}
