"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";
import { nomeMembro, prioritaPossibili, type Attivita } from "../../lib/tipi";
import { useRuoli, useSessione } from "../SessioneContext";
import Bottone from "../ui/Bottone";
import Campo from "../ui/Campo";
import Finestra from "../ui/Finestra";
import Selezione from "../ui/Selezione";

const campoSelect = "mt-1.5 h-[46px] w-full rounded-lg border border-bordo-campo bg-superficie px-3 text-[15px]";

type Props = {
  progettoId?: string;
  onChiudi: () => void;
  attivita?: Attivita; // se c'è, la finestra serve a MODIFICARE quell'attività
};

// La finestra con il modulo: crea un'attività nuova, oppure ne modifica una esistente.
// Se non si sa già il progetto (menu "+ Nuovo" in alto), chiede di sceglierlo.
export function FinestraNuovaAttivita({ progettoId, onChiudi: chiudi, attivita }: Props) {
  const router = useRouter();
  const { organizzazioneId, progetti, membri } = useSessione();
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);
  const attivi = membri.filter((m) => m.stato === "attivo");

  return (
    <Finestra titolo={attivita ? "Modifica attività" : "Nuova attività"} onChiudi={chiudi}>
      {!attivita && !progettoId && progetti.length === 0 ? (
        <div>
          <p className="text-[15px] text-testo-sec">Per creare un&apos;attività serve prima un progetto.</p>
          <div className="mt-4 flex justify-end">
            <Bottone variante="neutro" onClick={chiudi}>
              Chiudi
            </Bottone>
          </div>
        </div>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const dati = new FormData(e.currentTarget);
            const titolo = String(dati.get("attivita-titolo")).trim();
            if (!titolo) {
              setErrore("Scrivi il titolo dell'attività.");
              return;
            }
            setErrore("");
            setInCorso(true);
            const campi = {
              titolo,
              descrizione: String(dati.get("attivita-descrizione")).trim(),
              assegnatario_id: String(dati.get("attivita-assegnatario")) || null,
              priorita: String(dati.get("attivita-priorita")),
              scadenza: String(dati.get("attivita-scadenza")) || null,
              // "Design, Sito" -> ["Design", "Sito"]
              etichette: String(dati.get("attivita-etichette"))
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            };
            const tabella = creaClientBrowser().from("attivita");
            const { error } = attivita
              ? await tabella.update(campi).eq("id", attivita.id)
              : await tabella.insert({
                  ...campi,
                  organizzazione_id: organizzazioneId,
                  progetto_id: progettoId ?? String(dati.get("attivita-progetto")),
                });
            setInCorso(false);
            if (error) {
              setErrore("Non è stato possibile salvare l'attività. Riprova.");
              return;
            }
            router.refresh(); // rilegge i dati dal server: la nuova attività compare
            chiudi();
          }}
          className="space-y-4"
        >
          {!progettoId && !attivita && (
            <div>
              <label htmlFor="attivita-progetto" className="text-sm font-semibold">
                Progetto
              </label>
              <select id="attivita-progetto" name="attivita-progetto" className={campoSelect}>
                {progetti.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
          <Campo id="attivita-titolo" etichetta="Titolo" valoreIniziale={attivita?.titolo} obbligatorio />

          <div>
            <label htmlFor="attivita-descrizione" className="text-sm font-semibold">
              Descrizione
            </label>
            <textarea
              id="attivita-descrizione"
              name="attivita-descrizione"
              defaultValue={attivita?.descrizione}
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-bordo-campo bg-superficie px-3 py-2.5 text-[15px]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="attivita-assegnatario" className="text-sm font-semibold">
                Assegnata a
              </label>
              <select
                id="attivita-assegnatario"
                name="attivita-assegnatario"
                defaultValue={attivita?.assegnatarioId ?? ""}
                className={campoSelect}
              >
                <option value="">Nessuno</option>
                {attivi.map((m) => (
                  <option key={m.id} value={m.id}>
                    {nomeMembro(m)}
                  </option>
                ))}
              </select>
            </div>
            <Selezione id="attivita-priorita" etichetta="Priorità" opzioni={prioritaPossibili} valoreIniziale={attivita?.priorita ?? "Media"} />
          </div>

          <Campo
            id="attivita-scadenza"
            etichetta="Scadenza"
            tipo="date"
            valoreIniziale={attivita?.scadenza ?? undefined}
            obbligatorio
          />
          <Campo
            id="attivita-etichette"
            etichetta="Etichette (separate da virgola)"
            valoreIniziale={attivita?.etichette.join(", ")}
            suggerimento="Es. Design, Sito"
          />

          <p role="alert" className="text-sm text-errore">
            {errore}
          </p>
          <div className="flex justify-end gap-2">
            <Bottone variante="neutro" onClick={chiudi}>
              Annulla
            </Bottone>
            <Bottone tipo="submit">{inCorso ? "Salvataggio…" : attivita ? "Salva modifiche" : "Crea attività"}</Bottone>
          </div>
        </form>
      )}
    </Finestra>
  );
}

// Bottone "Nuova attività" che apre la finestra. Dentro un progetto il progetto è già noto (progettoId);
// altrove (es. "Le mie attività") la finestra chiede di sceglierlo, come la voce del menu "+ Nuovo".
export default function NuovaAttivita({ progettoId }: { progettoId?: string }) {
  const [aperta, setAperta] = useState(false);
  const { puoScrivere } = useRuoli();
  if (!puoScrivere) return null;

  return (
    <>
      <Bottone onClick={() => setAperta(true)}>Nuova attività</Bottone>
      {aperta && <FinestraNuovaAttivita progettoId={progettoId} onChiudi={() => setAperta(false)} />}
    </>
  );
}
