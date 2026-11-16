import type { Attivita, Progetto } from "../../lib/tipi";
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
      <VistaProgetto attivita={attivita} />
    </>
  );
}
