type BadgeProps = {
  testo: string;
  tono?: "primario" | "successo" | "attenzione";
};

// Colori testo/sfondo del design (contrasto sopra 4.5:1)
const toni = {
  primario: "bg-primario-chiaro text-primario",
  successo: "bg-successo-sfondo text-successo",
  attenzione: "bg-attenzione-sfondo text-attenzione",
};

// Etichetta di stato a pillola
export default function Badge({ testo, tono = "primario" }: BadgeProps) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${toni[tono]}`}
    >
      {testo}
    </span>
  );
}
