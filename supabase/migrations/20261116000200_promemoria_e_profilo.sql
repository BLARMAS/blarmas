-- Promemoria personali e modifica del proprio nome.

-- ---------- Promemoria ----------
-- Sono personali: ognuno vede solo i propri (anche gli altri membri della stessa organizzazione non li vedono).
create table public.promemoria (
  id uuid primary key default gen_random_uuid(),
  organizzazione_id uuid not null references public.organizzazioni (id) on delete cascade,
  utente_id uuid not null references auth.users (id) on delete cascade,
  testo text not null check (length(trim(testo)) > 0),
  scadenza date,
  fatto boolean not null default false,
  creato_il timestamptz not null default now()
);

create index promemoria_utente_idx on public.promemoria (utente_id);
create index promemoria_organizzazione_idx on public.promemoria (organizzazione_id);

alter table public.promemoria enable row level security;
grant select, insert, update, delete on public.promemoria to authenticated;

create policy "vedo i miei promemoria" on public.promemoria
  for select to authenticated
  using (utente_id = (select auth.uid()) and private.sono_membro(organizzazione_id));

create policy "creo i miei promemoria" on public.promemoria
  for insert to authenticated
  with check (utente_id = (select auth.uid()) and private.sono_membro(organizzazione_id));

create policy "modifico i miei promemoria" on public.promemoria
  for update to authenticated
  using (utente_id = (select auth.uid()) and private.sono_membro(organizzazione_id))
  with check (utente_id = (select auth.uid()) and private.sono_membro(organizzazione_id));

create policy "elimino i miei promemoria" on public.promemoria
  for delete to authenticated
  using (utente_id = (select auth.uid()) and private.sono_membro(organizzazione_id));

-- ---------- Cambiare il proprio nome ----------
-- Con le regole sulla tabella "membri" solo l'admin può modificare le righe.
-- Questa funzione permette a ognuno di cambiare SOLO il proprio nome (non il ruolo, non lo stato).
create function public.aggiorna_mio_nome(nuovo_nome text)
returns void
language sql security definer set search_path = ''
as $$
  update public.membri
  set nome = nullif(trim(nuovo_nome), '')
  where utente_id = (select auth.uid());
$$;

revoke all on function public.aggiorna_mio_nome(text) from public, anon;
grant execute on function public.aggiorna_mio_nome(text) to authenticated;
