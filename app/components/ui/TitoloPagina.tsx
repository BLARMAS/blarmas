import Link from "next/link";

type TitoloPaginaProps = {
  titolo: string;
  sotto?: string; // riga di spiegazione sotto il titolo
  briciole?: { nome: string; href: string }; // es. "Progetti /"
  azione?: React.ReactNode; // bottone a destra
};

export default function TitoloPagina({ titolo, sotto, briciole, azione }: TitoloPaginaProps) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        {briciole && (
          <Link href={briciole.href} className="text-sm text-testo-sec hover:underline">
            {briciole.nome} /
          </Link>
        )}
        <h1 className="text-[28px] leading-tight font-bold">{titolo}</h1>
        {sotto && <p className="mt-1 text-sm text-testo-sec">{sotto}</p>}
      </div>
      {azione}
    </div>
  );
}
