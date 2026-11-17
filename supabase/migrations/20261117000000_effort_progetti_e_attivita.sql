-- Effort di progetti e attività, salvato in ORE (i giorni si ricavano: 1 giorno = 8 ore).
-- Facoltativo: può restare vuoto. Si accettano anche decimali (es. 2,5 ore).
-- Si può eseguire anche se la colonna "giorni" dei progetti era già stata creata: viene convertita.

alter table public.progetti
  add column if not exists ore numeric(8, 2) check (ore is null or ore >= 0);

alter table public.attivita
  add column if not exists ore numeric(8, 2) check (ore is null or ore >= 0);

-- Se esisteva la colonna "giorni" nei progetti: copia il valore in ore (giorni x 8) e la elimina
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'progetti' and column_name = 'giorni'
  ) then
    update public.progetti set ore = giorni * 8 where ore is null and giorni is not null;
    alter table public.progetti drop column giorni;
  end if;
end $$;
