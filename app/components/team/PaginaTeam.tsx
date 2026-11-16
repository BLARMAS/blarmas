"use client";

import { etichettaRuolo } from "../../lib/tipi";
import { useSessione } from "../SessioneContext";
import { Cella, Tabella } from "../ui/Tabella";
import TitoloPagina from "../ui/TitoloPagina";
import InvitaPersone from "./InvitaPersone";

// Contenuto della pagina Team: le persone arrivano dal server (tramite la sessione)
export default function PaginaTeam() {
  const { membri } = useSessione();

  return (
    <>
      <TitoloPagina titolo="Team" azione={<InvitaPersone />} />
      <Tabella intestazioni={["Nome", "Email", "Ruolo", "Stato"]}>
        {membri.map((p) => (
          <tr key={p.id}>
            <Cella className="font-semibold">
              {p.nome || (
                <span className="font-normal text-testo-sec">
                  <span aria-hidden="true">—</span>
                  <span className="sr-only">Non ancora registrato</span>
                </span>
              )}
            </Cella>
            <Cella className="text-testo-sec">{p.email}</Cella>
            <Cella>{etichettaRuolo[p.ruolo]}</Cella>
            <Cella className={p.stato === "invitato" ? "text-attenzione" : ""}>
              {p.stato === "invitato" ? "Invitato" : "Attivo"}
            </Cella>
          </tr>
        ))}
      </Tabella>
    </>
  );
}
