"use client";

import { useState } from "react";
import type { Sessione } from "../../lib/tipi";
import { SessioneProvider } from "../SessioneContext";
import BarraAdmin from "./BarraAdmin";
import Sidebar from "./Sidebar";

// Mette insieme barra in alto, sidebar a sinistra e contenuto a destra.
export default function ShellApp({ sessione, children }: { sessione: Sessione; children: React.ReactNode }) {
  // useState = "memoria" del componente: qui ricorda se il menu è aperto (schermo stretto)
  const [menuAperto, setMenuAperto] = useState(false);

  return (
    // SessioneProvider condivide "chi sono" con tutti i componenti qui dentro
    <SessioneProvider sessione={sessione}>
      <div className="flex min-h-screen flex-col">
        <BarraAdmin menuAperto={menuAperto} onApriMenu={() => setMenuAperto(!menuAperto)} />
        <div className="flex flex-1">
          <Sidebar aperta={menuAperto} onChiudi={() => setMenuAperto(false)} />
          <main className="min-w-0 flex-1 p-5 md:p-8">{children}</main>
        </div>
      </div>
    </SessioneProvider>
  );
}
