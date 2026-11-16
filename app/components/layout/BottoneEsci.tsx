"use client";

import { useRouter } from "next/navigation";
import { creaClientBrowser } from "../../lib/supabase/client";
import Bottone from "../ui/Bottone";

// Bottone "Esci": chiude la sessione e torna alla pagina di accesso
export default function BottoneEsci({ variante = "neutro" }: { variante?: "neutro" | "primario" | "contorno" }) {
  const router = useRouter();

  return (
    <Bottone
      variante={variante}
      onClick={async () => {
        await creaClientBrowser().auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Esci
    </Bottone>
  );
}
