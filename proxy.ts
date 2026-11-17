import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Pagine che si possono vedere senza aver fatto il login
const pagineLibere = ["/", "/password-dimenticata", "/crea-organizzazione"];
// Pagine di accesso: se hai già fatto il login ti portano direttamente a /home
const pagineDiAccesso = ["/", "/password-dimenticata", "/crea-organizzazione"];

// Il proxy parte prima di ogni pagina. Qui fa due cose:
// 1. tiene aggiornata la sessione di chi ha fatto il login (i cookie di Supabase)
// 2. manda a "/" chi prova ad aprire una pagina dell'app senza essere loggato
export async function proxy(request: NextRequest) {
  let risposta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (daSalvare) => {
          daSalvare.forEach(({ name, value }) => request.cookies.set(name, value));
          risposta = NextResponse.next({ request });
          daSalvare.forEach(({ name, value, options }) => risposta.cookies.set(name, value, options));
        },
      },
    },
  );

  // getUser chiede a Supabase se la sessione è valida (non si fida solo del cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const percorso = request.nextUrl.pathname;
  const eLibera = pagineLibere.includes(percorso) || percorso.startsWith("/auth/");

  if (!user && !eLibera) {
    return reindirizza(request, "/", risposta);
  }
  if (user && pagineDiAccesso.includes(percorso)) {
    return reindirizza(request, "/home", risposta);
  }
  return risposta;
}

// Reindirizza tenendo i cookie di sessione eventualmente appena aggiornati
function reindirizza(request: NextRequest, verso: string, risposta: NextResponse) {
  const nuova = NextResponse.redirect(new URL(verso, request.url));
  risposta.cookies.getAll().forEach((c) => nuova.cookies.set(c));
  return nuova;
}

export const config = {
  // Tutte le pagine tranne i file interni di Next, il manifest dell'app e le immagini
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
