import { createBrowserClient } from "@supabase/ssr";

// Collegamento a Supabase da usare nei componenti "use client" (nel browser).
export function creaClientBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
