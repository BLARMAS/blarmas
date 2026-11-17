import type { MetadataRoute } from "next";

// Descrive l'app al telefono: nome, colori e icone. Serve per "Aggiungi alla schermata Home".
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Blarmas",
    short_name: "Blarmas",
    description: "Gestione progetti per team e aziende",
    lang: "it",
    start_url: "/",
    scope: "/",
    display: "standalone", // si apre a schermo intero, senza la barra del browser
    background_color: "#f6f7f9", // colore mentre l'app si apre (lo sfondo del sito)
    theme_color: "#11213f", // colore della barra di sistema (quello della barra in alto)
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // "maskable": Android può ritagliare l'icona in cerchio o altre forme; la "B" sta nella zona sicura
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
