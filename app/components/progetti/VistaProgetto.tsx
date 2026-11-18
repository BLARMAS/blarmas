"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";
import { nomeMembro, prioritaPossibili, type Attivita, type Stato } from "../../lib/tipi";
import { useRuoli, useSessione } from "../SessioneContext";
import TabellaCarico from "../carico/TabellaCarico";
import Bacheca from "./Bacheca";
import ListaAttivita from "./ListaAttivita";
import PannelloAttivita from "./PannelloAttivita";

const campoFiltro = "h-11 rounded-lg border border-bordo-campo bg-superficie px-3 text-sm font-medium";

// Parte interattiva della pagina di un progetto: bacheca/lista, filtri e pannello di dettaglio.
// Le attività arrivano dal server; le modifiche si salvano su Supabase e poi la pagina si aggiorna.
export default function VistaProgetto({ attivita, oggi }: { attivita: Attivita[]; oggi: string }) {
  const router = useRouter();
  const { membri } = useSessione();
  const { puoScrivere } = useRuoli();
  const [vista, setVista] = useState<"bacheca" | "lista" | "team">("bacheca");
  const [aperta, setAperta] = useState<string | null>(null);
  const [errore, setErrore] = useState("");
  const [ricerca, setRicerca] = useState("");
  const [persona, setPersona] = useState("");
  const [priorita, setPriorita] = useState("");

  const visibili = attivita.filter(
    (a) =>
      a.titolo.toLowerCase().includes(ricerca.toLowerCase()) &&
      (!persona || a.assegnatarioId === persona) &&
      (!priorita || a.priorita === priorita),
  );
  const selezionata = attivita.find((a) => a.id === aperta);

  // Cambia lo stato di un'attività (trascinando la card o dal pannello) e lo salva nel database
  async function cambiaStato(id: string, stato: Stato) {
    if (!puoScrivere) return;
    setErrore("");
    const { error } = await creaClientBrowser().from("attivita").update({ stato }).eq("id", id);
    if (error) {
      setErrore("Non è stato possibile spostare l'attività. Riprova.");
      return;
    }
    router.refresh(); // rilegge i dati dal server
  }

  const bottoneVista = (v: "bacheca" | "lista" | "team", nome: string) => (
    <button
      type="button"
      aria-pressed={vista === v}
      onClick={() => setVista(v)}
      className={`min-h-11 rounded-lg px-4 text-sm font-semibold ${vista === v ? "bg-superficie text-testo shadow-sm" : "text-testo-sec"}`}
    >
      {nome}
    </button>
  );

  return (
    <>
      {/* I filtri lavorano mentre scrivi: il form serve solo a tenere la struttura giusta, e Invio non ricarica la pagina */}
      <form
        role="search"
        aria-label="Filtra le attività"
        onSubmit={(e) => e.preventDefault()}
        className="mb-4 flex flex-wrap items-center gap-2.5"
      >
        <div className="flex gap-1 rounded-xl bg-colonna p-1" role="group" aria-label="Tipo di vista">
          {bottoneVista("bacheca", "Bacheca")}
          {bottoneVista("lista", "Lista")}
          {bottoneVista("team", "Team")}
        </div>

        {vista !== "team" && (
          <>
        <div>
          <label htmlFor="cerca-attivita" className="sr-only">
            Cerca attività
          </label>
          <input
            id="cerca-attivita"
            type="search"
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
            placeholder="Cerca attività"
            className={`${campoFiltro} w-[220px] font-normal placeholder:text-testo-sec`}
          />
        </div>

        <div>
          <label htmlFor="filtro-persona" className="sr-only">
            Filtra per assegnatario
          </label>
          <select id="filtro-persona" value={persona} onChange={(e) => setPersona(e.target.value)} className={campoFiltro}>
            <option value="">Assegnatario</option>
            {membri
              .filter((m) => m.stato === "attivo")
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {nomeMembro(m)}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="filtro-priorita" className="sr-only">
            Filtra per priorità
          </label>
          <select id="filtro-priorita" value={priorita} onChange={(e) => setPriorita(e.target.value)} className={campoFiltro}>
            <option value="">Priorità</option>
            {prioritaPossibili.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
          </>
        )}
      </form>

      <p role="alert" className="mb-3 text-sm text-errore">
        {errore}
      </p>

      {vista === "team" ? (
        <TabellaCarico attivita={attivita} oggi={oggi} />
      ) : attivita.length === 0 ? (
        <p className="rounded-xl border border-bordo bg-superficie p-5 text-testo-sec">
          Questo progetto non ha ancora attività.{puoScrivere && " Creane una con il bottone “Nuova attività”."}
        </p>
      ) : vista === "bacheca" ? (
        <Bacheca attivita={visibili} onApri={setAperta} onSposta={cambiaStato} puoSpostare={puoScrivere} />
      ) : (
        <ListaAttivita attivita={visibili} onApri={setAperta} />
      )}

      {selezionata && (
        <PannelloAttivita attivita={selezionata} onChiudi={() => setAperta(null)} onCambiaStato={cambiaStato} />
      )}
    </>
  );
}
