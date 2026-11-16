// Struttura delle pagine di accesso: pannello blu a sinistra, modulo a destra.
// Su schermo stretto il pannello blu diventa una fascia in alto.
export default function LayoutAccesso({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="flex flex-col justify-between bg-primario p-6 text-white md:p-16">
        <span className="text-2xl font-bold tracking-tight">Blarmas</span>

        <div className="my-10 max-w-[460px] md:my-0">
          <p className="text-[32px] leading-tight font-bold tracking-tight md:text-[40px]">
            Tutti i progetti del team, in un unico posto.
          </p>
          <p className="mt-4 text-base">
            Pianifica, assegna e segui le attività con bacheche, liste e scadenze.
          </p>
        </div>

        <p className="hidden text-sm md:block">© Blarmas</p>
      </section>

      <main className="flex items-center justify-center bg-sfondo p-6">
        <div className="w-full max-w-[380px]">{children}</div>
      </main>
    </div>
  );
}
