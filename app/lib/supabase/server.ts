import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Collegamento a Supabase da usare nelle pagine e nelle azioni del server.
// Legge la sessione di chi ha fatto il login dai cookie.
export async function creaClientServer() {
  const archivioCookie = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => archivioCookie.getAll(),
        setAll: (daSalvare) => {
          try {
            daSalvare.forEach(({ name, value, options }) => archivioCookie.set(name, value, options));
          } catch {
            // Nelle pagine (Server Component) i cookie non si possono scrivere: si può ignorare,
            // perché li aggiorna il proxy (lo aggiungiamo con il login).
          }
        },
      },
    },
  );
}
