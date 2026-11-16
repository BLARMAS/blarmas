type BarraProgressoProps = {
  percentuale: number; // da 0 a 100
  colore?: string; // classe Tailwind del riempimento
  etichetta: string; // letta dagli screen reader
};

// Barra di avanzamento alta 6px
export default function BarraProgresso({
  percentuale,
  colore = "bg-primario",
  etichetta,
}: BarraProgressoProps) {
  return (
    <div
      role="progressbar"
      aria-label={etichetta}
      aria-valuenow={percentuale}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 w-full overflow-hidden rounded-full bg-bordo"
    >
      <div className={`h-full rounded-full ${colore}`} style={{ width: `${percentuale}%` }} />
    </div>
  );
}
