-- Data di inizio di progetti e attività (facoltativa). Non può essere dopo la scadenza.
alter table public.progetti add column if not exists inizio date;
alter table public.attivita add column if not exists inizio date;

alter table public.progetti
  add constraint progetti_inizio_prima_scadenza check (inizio is null or scadenza is null or inizio <= scadenza);
alter table public.attivita
  add constraint attivita_inizio_prima_scadenza check (inizio is null or scadenza is null or inizio <= scadenza);
