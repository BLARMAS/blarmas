"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";
import { etichettaRuolo, nomeMembro, type Membro, type Ruolo, type StatoMembro } from "../../lib/tipi";
import { useSessione } from "../SessioneContext";
import Bottone from "../ui/Bottone";
import Campo from "../ui/Campo";
import Finestra from "../ui/Finestra";
import FinestraConferma from "../ui/FinestraConferma";

const campoSelect = "mt-1.5 h-[46px] w-full rounded-lg border border-bordo-campo bg-superficie px-3 text-[15px]";
const nomiStato: Record<StatoMembro, string> = { attivo: "Attivo", invitato: "Invitato", sospeso: "Sospeso" };

// Traduce l'errore del database in un messaggio comprensibile
function messaggioDi(errore: { message: string }, predefinito: string) {
  return errore.message.includes("almeno un amministratore")
    ? "Deve restare almeno un amministratore attivo."
    : predefinito;
}

// Finestra per modificare nome, ruolo e stato di una persona del team
function FinestraModifica({ membro, onChiudi }: { membro: Membro; onChiudi: () => void }) {
  const router = useRouter();
  const { membroId } = useSessione();
  const [errore, setErrore] = useState("");
  const [inCorso, setInCorso] = useState(false);

  // Su sé stessi e sul segnaposto non si cambiano ruolo e stato (ci si toglierebbe l'accesso da soli)
  const soloNome = membro.segnaposto || membro.id === membroId;
  // Chi ha già un account passa da Attivo a Sospeso; chi non si è ancora registrato da Invitato a Sospeso
  const statiPossibili: StatoMembro[] = membro.registrato ? ["attivo", "sospeso"] : ["invitato", "sospeso"];

  return (
    <Finestra titolo="Modifica persona" onChiudi={onChiudi}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const dati = new FormData(e.currentTarget);
          setErrore("");
          setInCorso(true);
          const nome = String(dati.get("membro-nome")).trim() || null;
          const campi = soloNome
            ? { nome }
            : { nome, ruolo: String(dati.get("membro-ruolo")), stato: String(dati.get("membro-stato")) };
          const { error } = await creaClientBrowser().from("membri").update(campi).eq("id", membro.id);
          setInCorso(false);
          if (error) {
            setErrore(messaggioDi(error, "Non è stato possibile salvare. Riprova."));
            return;
          }
          router.refresh(); // rilegge i dati dal server
          onChiudi();
        }}
        className="space-y-4"
      >
        <Campo id="membro-nome" etichetta="Nome" valoreIniziale={membro.nome ?? ""} />
        {membro.email && (
          <p className="text-sm text-testo-sec">
            Email: <strong className="text-testo">{membro.email}</strong>
          </p>
        )}

        {soloNome ? (
          <p className="text-sm text-testo-sec">
            {membro.segnaposto
              ? "È la persona di default: serve per assegnare attività quando non c'è una persona precisa. Non si può eliminare né cambiare ruolo o stato."
              : "Non puoi cambiare ruolo o stato del tuo stesso account."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="membro-ruolo" className="text-sm font-semibold">
                Ruolo
              </label>
              <select id="membro-ruolo" name="membro-ruolo" defaultValue={membro.ruolo} className={campoSelect}>
                {(Object.keys(etichettaRuolo) as Ruolo[]).map((r) => (
                  <option key={r} value={r}>
                    {etichettaRuolo[r]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="membro-stato" className="text-sm font-semibold">
                Stato
              </label>
              <select id="membro-stato" name="membro-stato" defaultValue={membro.stato} className={campoSelect}>
                {statiPossibili.map((s) => (
                  <option key={s} value={s}>
                    {nomiStato[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {!soloNome && (
          <p className="text-xs text-testo-sec">
            Sospeso: la persona resta nel team ma non può più accedere a Blarmas. Si può riattivare in qualsiasi momento.
          </p>
        )}

        <p role="alert" className="text-sm text-errore">
          {errore}
        </p>
        <div className="flex justify-end gap-2">
          <Bottone variante="neutro" onClick={onChiudi}>
            Annulla
          </Bottone>
          <Bottone tipo="submit">{inCorso ? "Salvataggio…" : "Salva modifiche"}</Bottone>
        </div>
      </form>
    </Finestra>
  );
}

// Bottoni "Modifica" ed "Elimina" di una riga del team (li vede solo l'admin)
export default function AzioniMembro({ membro }: { membro: Membro }) {
  const router = useRouter();
  const { membroId } = useSessione();
  const [finestra, setFinestra] = useState<"modifica" | "elimina" | null>(null);
  const nome = nomeMembro(membro);
  // Non si elimina sé stessi né il segnaposto
  const puoEliminare = !membro.segnaposto && membro.id !== membroId;

  async function elimina() {
    const { error } = await creaClientBrowser().from("membri").delete().eq("id", membro.id);
    if (error) return messaggioDi(error, "Non è stato possibile eliminare la persona. Riprova.");
    router.refresh();
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1">
      <button
        type="button"
        onClick={() => setFinestra("modifica")}
        className="min-h-11 rounded-lg px-3 text-sm font-semibold text-primario hover:bg-primario-chiaro"
      >
        Modifica<span className="sr-only"> {nome}</span>
      </button>
      {puoEliminare && (
        <button
          type="button"
          onClick={() => setFinestra("elimina")}
          className="min-h-11 rounded-lg px-3 text-sm font-semibold text-errore hover:bg-sfondo"
        >
          Elimina<span className="sr-only"> {nome}</span>
        </button>
      )}

      {finestra === "modifica" && <FinestraModifica membro={membro} onChiudi={() => setFinestra(null)} />}
      {finestra === "elimina" && (
        <FinestraConferma
          titolo="Eliminare la persona dal team?"
          testo={`Stai per eliminare “${nome}” dal team. Le sue attività restano, ma senza assegnatario. Se ha un account, perde l'accesso all'organizzazione. L'operazione non si può annullare.`}
          etichettaConferma="Elimina persona"
          onConferma={elimina}
          onChiudi={() => setFinestra(null)}
        />
      )}
    </div>
  );
}
