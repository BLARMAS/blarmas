type StatisticaProps = {
  etichetta: string;
  valore: string;
  errore?: boolean; // numero in rosso
};

// Riquadro con un numero grande (es. "Progetti attivi 6")
export default function Statistica({ etichetta, valore, errore }: StatisticaProps) {
  return (
    <div className="rounded-xl border border-bordo bg-superficie p-5">
      <p className="text-sm text-testo-sec">{etichetta}</p>
      <p className={`text-[30px] leading-tight font-bold ${errore ? "text-errore" : ""}`}>
        {valore}
      </p>
    </div>
  );
}
