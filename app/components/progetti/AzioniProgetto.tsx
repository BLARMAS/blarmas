"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";
import type { Progetto } from "../../lib/tipi";
import { useRuoli } from "../SessioneContext";
import Bottone from "../ui/Bottone";
import FinestraConferma from "../ui/FinestraConferma";
import { FinestraNuovoProgetto } from "./NuovoProgetto";

// Bottoni "Modifica" ed "Elimina" nella pagina di un progetto.
// Modifica: admin e membri. Elimina: solo l'admin (lo decide anche il database).
export default function AzioniProgetto({ progetto }: { progetto: Progetto }) {
  const router = useRouter();
  const { puoScrivere, eAdmin } = useRuoli();
  const [finestra, setFinestra] = useState<"modifica" | "elimina" | null>(null);

  async function elimina() {
    const { error } = await creaClientBrowser().from("progetti").delete().eq("id", progetto.id);
    if (error) return "Non è stato possibile eliminare il progetto. Riprova.";
    router.push("/progetti");
    router.refresh(); // rilegge i dati dal server: il progetto non c'è più
    return null;
  }

  const attivita = progetto.totaleAttivita;

  return (
    <>
      {puoScrivere && (
        <Bottone variante="neutro" onClick={() => setFinestra("modifica")}>
          Modifica
        </Bottone>
      )}
      {eAdmin && (
        <Bottone variante="neutro" onClick={() => setFinestra("elimina")}>
          Elimina
        </Bottone>
      )}

      {finestra === "modifica" && <FinestraNuovoProgetto progetto={progetto} onChiudi={() => setFinestra(null)} />}
      {finestra === "elimina" && (
        <FinestraConferma
          titolo="Eliminare il progetto?"
          testo={`Stai per eliminare “${progetto.nome}”${
            attivita > 0 ? ` e le sue ${attivita} attività` : ""
          }. L'operazione non si può annullare.`}
          etichettaConferma="Elimina progetto"
          onConferma={elimina}
          onChiudi={() => setFinestra(null)}
        />
      )}
    </>
  );
}
