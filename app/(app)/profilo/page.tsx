import type { Metadata } from "next";
import FormPassword from "../../components/profilo/FormPassword";
import FormProfilo from "../../components/profilo/FormProfilo";
import BottoneEsci from "../../components/layout/BottoneEsci";
import TitoloPagina from "../../components/ui/TitoloPagina";
import { caricaSessione } from "../../lib/db";
import { etichettaRuolo, iniziali } from "../../lib/tipi";

export const metadata: Metadata = { title: "Profilo" };

// Riquadro bianco con un titolo, usato per ogni sezione della pagina
function Sezione({ id, titolo, children }: { id: string; titolo: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-xl border border-bordo bg-superficie p-5">
      <h2 id={id} className="mb-4 text-base font-bold">
        {titolo}
      </h2>
      {children}
    </section>
  );
}

export default async function ProfiloPage() {
  const sessione = (await caricaSessione())!; // il layout ha già controllato che ci sia

  return (
    <div className="max-w-[720px]">
      <TitoloPagina titolo="Profilo" />

      <div className="space-y-5">
        <div className="flex items-center gap-4 rounded-xl border border-bordo bg-superficie p-5">
          <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full bg-avatar text-lg font-bold text-admin">
            {iniziali(sessione.nome)}
          </span>
          <div>
            <p className="text-lg font-bold">{sessione.nome}</p>
            <p className="text-sm text-testo-sec">
              {etichettaRuolo[sessione.ruolo]} · {sessione.organizzazioneNome}
            </p>
          </div>
        </div>

        <Sezione id="titolo-dati" titolo="Dati personali">
          <FormProfilo nome={sessione.nome} email={sessione.email} />
        </Sezione>

        <Sezione id="titolo-password" titolo="Password">
          <FormPassword />
        </Sezione>

        <Sezione id="titolo-notifiche" titolo="Notifiche">
          <ul>
            <li>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-primario" />
                Avvisami quando mi assegnano un&apos;attività
              </label>
            </li>
            <li>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-primario" />
                Avvisami delle scadenze in arrivo
              </label>
            </li>
          </ul>
        </Sezione>

        <BottoneEsci />
      </div>
    </div>
  );
}
