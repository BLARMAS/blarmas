import type { Attivita } from "../../lib/tipi";
import { formattaData } from "../../lib/date";
import { Cella, Tabella } from "../ui/Tabella";

const coloreStato = {
  "Da fare": "",
  "In corso": "font-bold text-primario",
  Fatto: "font-bold text-successo",
};

// Vista a lista: una riga per attività
export default function ListaAttivita({
  attivita,
  onApri,
}: {
  attivita: Attivita[];
  onApri: (id: string) => void;
}) {
  if (attivita.length === 0) {
    return (
      <p className="rounded-xl border border-bordo bg-superficie p-5 text-testo-sec">
        Nessuna attività corrisponde ai filtri.
      </p>
    );
  }

  return (
    <Tabella intestazioni={["Attività", "Stato", "Assegnata a", "Scadenza", "Priorità"]}>
      {attivita.map((a) => (
        <tr key={a.id}>
          <Cella>
            <button type="button" onClick={() => onApri(a.id)} className="min-h-11 text-left font-medium hover:text-primario hover:underline">
              {a.titolo}
            </button>
          </Cella>
          <Cella className={coloreStato[a.stato]}>{a.stato}</Cella>
          <Cella>{a.assegnatario}</Cella>
          <Cella>{formattaData(a.scadenza)}</Cella>
          <Cella>{a.priorita}</Cella>
        </tr>
      ))}
    </Tabella>
  );
}
