"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { vociMenu } from "./menu";

type SidebarProps = {
  aperta: boolean; // vale solo su schermo stretto
  onChiudi: () => void;
};

export default function Sidebar({ aperta, onChiudi }: SidebarProps) {
  // Ci dice in che pagina siamo, per evidenziare la voce giusta
  const percorso = usePathname();

  return (
    <>
      {/* Sfondo scuro dietro il menu, solo su schermo stretto */}
      {aperta && (
        <button
          type="button"
          aria-label="Chiudi il menu"
          onClick={onChiudi}
          className="fixed inset-0 top-16 z-20 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-20 w-[232px] shrink-0 overflow-y-auto border-r border-bordo bg-superficie p-4 transition-transform md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:translate-x-0 md:visible ${
          aperta ? "translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        <nav aria-label="Menu principale">
          <ul className="space-y-1">
            {vociMenu.map((voce) => {
              const attiva = percorso === voce.href || percorso.startsWith(`${voce.href}/`);
              return (
                <li key={voce.href}>
                  <Link
                    href={voce.href}
                    onClick={onChiudi}
                    aria-current={attiva ? "page" : undefined}
                    className={`flex min-h-10 items-center rounded-lg px-3 text-[15px] ${
                      attiva
                        ? "bg-primario-chiaro font-semibold text-primario"
                        : "text-testo-sec hover:bg-sfondo"
                    }`}
                  >
                    {voce.nome}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
