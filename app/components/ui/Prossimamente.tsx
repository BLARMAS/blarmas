// Riquadro per le pagine che non hanno ancora i dati veri: spiega che arriveranno
export default function Prossimamente({ testo }: { testo: string }) {
  return (
    <div role="status" className="rounded-xl border border-dashed border-bordo-campo bg-superficie p-8 text-center">
      <p className="text-base font-bold">Disponibile prossimamente</p>
      <p className="mx-auto mt-1 max-w-[480px] text-[15px] text-testo-sec">{testo}</p>
    </div>
  );
}
