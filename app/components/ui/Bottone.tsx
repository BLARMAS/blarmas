import Link from "next/link";

type BottoneProps = {
  variante?: "primario" | "contorno" | "neutro" | "bianco" | "pericolo";
  href?: string; // se c'è, diventa un link
  onClick?: () => void;
  tipo?: "button" | "submit"; // "submit" per i bottoni che inviano un modulo
  children: React.ReactNode;
  className?: string;
};

const varianti = {
  primario: "bg-primario text-white hover:bg-primario-scuro",
  contorno: "border border-primario bg-superficie text-primario hover:bg-primario-chiaro",
  neutro: "border border-bordo-campo bg-superficie text-testo hover:bg-sfondo",
  bianco: "bg-white text-admin hover:bg-primario-chiaro",
  pericolo: "bg-errore text-white hover:opacity-90", // per le azioni che non si possono annullare
};

// Bottone alto almeno 44px, raggio 8px. Con "href" è un vero link, altrimenti un vero button.
export default function Bottone({
  variante = "primario",
  href,
  onClick,
  tipo = "button",
  children,
  className = "",
}: BottoneProps) {
  const classi = `inline-flex min-h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold ${varianti[variante]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classi}>
        {children}
      </Link>
    );
  }
  return (
    <button type={tipo} onClick={onClick} className={classi}>
      {children}
    </button>
  );
}
