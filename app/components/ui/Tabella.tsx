// Tabella con bordo arrotondato. Su schermo stretto scorre in orizzontale.
export function Tabella({
  intestazioni,
  children,
}: {
  intestazioni: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-bordo bg-superficie">
      <table className="w-full min-w-[520px] text-left text-[15px]">
        <thead>
          <tr className="border-b border-bordo">
            {intestazioni.map((nome) => (
              <th key={nome} scope="col" className="px-3 py-3.5 text-xs sm:px-5 font-semibold text-testo-sec">
                {nome}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-bordo">{children}</tbody>
      </table>
    </div>
  );
}

export function Cella({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-3 sm:px-5 ${className}`}>{children}</td>;
}
