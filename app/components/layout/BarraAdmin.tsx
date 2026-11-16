import Link from "next/link";
import MenuNuovo from "./MenuNuovo";
import MenuProfilo from "./MenuProfilo";
import Notifiche from "./Notifiche";
import Ricerca from "./Ricerca";
import SelettoreOrganizzazione from "./SelettoreOrganizzazione";

type BarraAdminProps = {
  onApriMenu: () => void;
  menuAperto: boolean;
};

// Barra scura in alto, alta 64px: logo, organizzazione, ricerca, + Nuovo, notifiche, profilo
export default function BarraAdmin({ onApriMenu, menuAperto }: BarraAdminProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-admin px-4 text-white">
      {/* Bottone menu: solo su schermo stretto */}
      <button
        type="button"
        onClick={onApriMenu}
        aria-label="Apri il menu"
        aria-expanded={menuAperto}
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-admin-campo hover:bg-admin-bordo md:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <Link href="/home" className="mr-2 text-xl font-bold tracking-tight md:w-[196px]">
        Blarmas
      </Link>

      <SelettoreOrganizzazione />

      <Ricerca />

      <div className="ml-auto flex items-center gap-2.5">
        <MenuNuovo />
        <Notifiche />
        <MenuProfilo />
      </div>
    </header>
  );
}
