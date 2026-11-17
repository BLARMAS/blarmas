"use client";

import { etichettaRuolo, type StatoMembro } from "../../lib/tipi";
import { useRuoli, useSessione } from "../SessioneContext";
import { Cella, Tabella } from "../ui/Tabella";
import TitoloPagina from "../ui/TitoloPagina";
import AzioniMembro from "./AzioniMembro";
import InvitaPersone from "./InvitaPersone";

const testoStato: Record<StatoMembro, string> = { attivo: "Attivo", invitato: "Invitato", sospeso: "Sospeso" };
const coloreStato: Record<StatoMembro, string> = { attivo: "", invitato: "text-attenzione", sospeso: "text-errore" };

// Contenuto della pagina Team: le persone arrivano dal server (tramite la sessione)
export default function PaginaTeam() {
  const { membri } = useSessione();
  const { eAdmin } = useRuoli();

  return (
    <>
      <TitoloPagina titolo="Team" azione={<InvitaPersone />} />
      <Tabella intestazioni={eAdmin ? ["Nome", "Email", "Ruolo", "Stato", "Azioni"] : ["Nome", "Email", "Ruolo", "Stato"]}>
        {membri.map((p) => (
          <tr key={p.id}>
            <Cella className="font-semibold">
              {p.nome || (
                <span className="font-normal text-testo-sec">
                  <span aria-hidden="true">—</span>
                  <span className="sr-only">Non ancora registrato</span>
                </span>
              )}
              {p.segnaposto && <span className="ml-2 text-xs font-normal text-testo-sec">segnaposto</span>}
            </Cella>
            <Cella className="text-testo-sec">
              {p.email ?? (
                <>
                  <span aria-hidden="true">—</span>
                  <span className="sr-only">Nessuna email</span>
                </>
              )}
            </Cella>
            <Cella>{etichettaRuolo[p.ruolo]}</Cella>
            <Cella className={coloreStato[p.stato]}>{testoStato[p.stato]}</Cella>
            {eAdmin && (
              <Cella>
                <AzioniMembro membro={p} />
              </Cella>
            )}
          </tr>
        ))}
      </Tabella>
    </>
  );
}
