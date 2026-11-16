"use client";

import { useRouter } from "next/navigation";
import { useSessione } from "../SessioneContext";

// Menu a tendina con le organizzazioni di cui fai parte: scegliendone una cambia quella in uso
export default function SelettoreOrganizzazione() {
  const router = useRouter();
  const { organizzazioni, organizzazioneId } = useSessione();

  return (
    <div className="hidden sm:block">
      <label htmlFor="organizzazione" className="sr-only">
        Organizzazione
      </label>
      <select
        id="organizzazione"
        value={organizzazioneId}
        onChange={(e) => {
          // La scelta si ricorda in un cookie; il server la controlla a ogni visita
          document.cookie = `org=${e.target.value}; path=/; max-age=31536000; samesite=lax`;
          router.push("/home");
          router.refresh();
        }}
        className="h-11 max-w-48 rounded-lg border border-admin-bordo bg-admin-campo px-3 text-sm font-medium text-white"
      >
        {organizzazioni.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
