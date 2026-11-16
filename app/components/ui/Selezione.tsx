type SelezioneProps = {
  id: string;
  etichetta: string;
  opzioni: string[];
  valoreIniziale?: string;
};

// Menu a tendina con la sua etichetta (label), alto almeno 44px
export default function Selezione({ id, etichetta, opzioni, valoreIniziale }: SelezioneProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {etichetta}
      </label>
      <select
        id={id}
        name={id}
        defaultValue={valoreIniziale}
        className="mt-1.5 h-[46px] w-full rounded-lg border border-bordo-campo bg-superficie px-3 text-[15px]"
      >
        {opzioni.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
