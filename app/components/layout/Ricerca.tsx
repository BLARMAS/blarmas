"use client";

// Ricerca generale nella barra in alto. Per ora non cerca niente: la ricerca vera arriva con il database.
export default function Ricerca() {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()} // evita che la pagina si ricarichi premendo Invio
      className="hidden flex-1 md:block md:max-w-[448px]"
    >
      <label htmlFor="ricerca" className="sr-only">
        Cerca
      </label>
      <input
        id="ricerca"
        name="ricerca"
        type="search"
        placeholder="Cerca progetti, attività, persone"
        className="h-11 w-full rounded-lg bg-admin-campo px-3.5 text-sm text-white placeholder:text-slate-300"
      />
    </form>
  );
}
