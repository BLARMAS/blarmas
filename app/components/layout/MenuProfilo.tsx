"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { creaClientBrowser } from "../../lib/supabase/client";
import { iniziali } from "../../lib/tipi";
import { useSessione } from "../SessioneContext";

// Cerchio con le iniziali: apre un piccolo menu con "Profilo" ed "Esci"
export default function MenuProfilo() {
  const [aperto, setAperto] = useState(false);
  const router = useRouter();
  const { nome } = useSessione();
  const riquadroRef = useRef<HTMLDivElement>(null);

  async function esci() {
    await creaClientBrowser().auth.signOut();
    router.push("/");
    router.refresh();
  }

  // Si chiude con Esc oppure cliccando fuori
  useEffect(() => {
    if (!aperto) return;
    const conEsc = (e: KeyboardEvent) => e.key === "Escape" && setAperto(false);
    const conClic = (e: MouseEvent) => {
      if (!riquadroRef.current?.contains(e.target as Node)) setAperto(false);
    };
    window.addEventListener("keydown", conEsc);
    document.addEventListener("mousedown", conClic);
    return () => {
      window.removeEventListener("keydown", conEsc);
      document.removeEventListener("mousedown", conClic);
    };
  }, [aperto]);

  return (
    <div ref={riquadroRef} className="relative">
      <button
        type="button"
        aria-label={`Profilo di ${nome}`}
        aria-expanded={aperto}
        onClick={() => setAperto(!aperto)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-avatar text-xs font-bold text-admin"
      >
        {iniziali(nome)}
      </button>

      {aperto && (
        <ul className="absolute top-13 right-0 z-40 w-44 rounded-xl border border-bordo bg-superficie p-1.5 text-testo shadow-lg">
          <li>
            <Link
              href="/profilo"
              onClick={() => setAperto(false)}
              className="flex min-h-11 items-center rounded-lg px-3 text-[15px] hover:bg-sfondo"
            >
              Profilo
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={esci}
              className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-[15px] hover:bg-sfondo"
            >
              Esci
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
