-- Ore già consumate su un'attività (in ore; i giorni si ricavano: 1 giorno = 8 ore).
-- Parte da 0. Può superare le ore assegnate (sforamento).
alter table public.attivita
  add column if not exists ore_consumate numeric(8, 2) not null default 0 check (ore_consumate >= 0);
