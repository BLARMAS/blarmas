type CampoProps = {
  id: string;
  etichetta: string;
  tipo?: "text" | "email" | "password" | "date";
  valoreIniziale?: string;
  autoComplete?: string;
  suggerimento?: string; // testo grigio di esempio dentro il campo (placeholder)
  obbligatorio?: boolean;
};

// Campo di testo con la sua etichetta (label), alto almeno 44px
export default function Campo({
  id,
  etichetta,
  tipo = "text",
  valoreIniziale,
  autoComplete,
  suggerimento,
  obbligatorio,
}: CampoProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {etichetta}
      </label>
      <input
        id={id}
        name={id}
        type={tipo}
        defaultValue={valoreIniziale}
        autoComplete={autoComplete}
        placeholder={suggerimento}
        required={obbligatorio}
        className="mt-1.5 h-[46px] w-full rounded-lg border border-bordo-campo bg-superficie px-3 text-[15px] placeholder:text-testo-sec"
      />
    </div>
  );
}
