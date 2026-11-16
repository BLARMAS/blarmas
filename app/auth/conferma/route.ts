import { NextResponse } from "next/server";
import { creaClientServer } from "../../lib/supabase/server";

// Qui arriva chi clicca il link dell'email per scegliere una nuova password.
// Il link porta un "code": lo scambiamo con una sessione (cioè fa entrare la persona)
// e poi la portiamo alla pagina dove sceglie la nuova password.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await creaClientServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/password-nuova`);
  }
  // Link scaduto, già usato o aperto da un altro browser
  return NextResponse.redirect(`${origin}/password-dimenticata?link=scaduto`);
}
