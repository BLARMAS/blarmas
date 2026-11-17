-- Team: persona segnaposto senza email, stato "sospeso", protezione dell'ultimo admin.

-- ---------- 1. Segnaposto: un membro senza email e senza account ----------
alter table public.membri alter column email drop not null;
alter table public.membri drop constraint if exists membri_email_check;
alter table public.membri
  add constraint membri_email_valida check (email is null or position('@' in email) > 1);

alter table public.membri add column if not exists segnaposto boolean not null default false;

-- Il segnaposto non ha email né account; e senza email si può stare nel team solo come segnaposto
alter table public.membri
  add constraint membri_segnaposto_senza_account check (not segnaposto or (email is null and utente_id is null));
alter table public.membri
  add constraint membri_senza_email_solo_segnaposto check (email is not null or segnaposto);

-- Ogni organizzazione ha al massimo un segnaposto
create unique index if not exists membri_un_segnaposto on public.membri (organizzazione_id) where segnaposto;

-- Lo creo per le organizzazioni che già esistono
insert into public.membri (organizzazione_id, nome, ruolo, stato, segnaposto)
select o.id, 'Da assegnare', 'membro', 'attivo', true
from public.organizzazioni o
where not exists (select 1 from public.membri m where m.organizzazione_id = o.id and m.segnaposto);

-- ---------- 2. Nuovo stato "sospeso": resta nel team ma non può più accedere ----------
alter table public.membri drop constraint if exists membri_stato_check;
alter table public.membri
  add constraint membri_stato_check check (stato in ('attivo', 'invitato', 'sospeso'));

-- ---------- 3. Eliminare membri: l'admin può, ma non il segnaposto ----------
drop policy if exists "l'admin rimuove i membri" on public.membri;
create policy "l'admin rimuove i membri" on public.membri
  for delete to authenticated
  using (private.sono_admin(organizzazione_id) and not segnaposto);

-- ---------- 4. Deve restare sempre almeno un admin attivo ----------
create function private.proteggi_ultimo_admin() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  -- Se l'organizzazione è stata eliminata (a cascata) non c'è niente da proteggere
  if not exists (select 1 from public.organizzazioni where id = old.organizzazione_id) then
    return coalesce(new, old);
  end if;
  if old.ruolo = 'admin' and old.stato = 'attivo'
     and (tg_op = 'DELETE' or new.ruolo <> 'admin' or new.stato <> 'attivo') then
    if not exists (
      select 1 from public.membri
      where organizzazione_id = old.organizzazione_id and ruolo = 'admin' and stato = 'attivo' and id <> old.id
    ) then
      raise exception 'Deve restare almeno un amministratore attivo';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger membri_proteggi_ultimo_admin
  before update or delete on public.membri
  for each row execute function private.proteggi_ultimo_admin();

-- ---------- 5. Ogni nuova organizzazione nasce con il suo segnaposto ----------
create or replace function public.crea_organizzazione(nome_organizzazione text, nome_persona text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  nuova_id uuid;
  email_login text := auth.jwt() ->> 'email';
begin
  if auth.uid() is null or email_login is null then
    raise exception 'Devi fare il login';
  end if;
  insert into public.organizzazioni (nome) values (trim(nome_organizzazione)) returning id into nuova_id;
  insert into public.membri (organizzazione_id, utente_id, email, nome, ruolo, stato)
  values (nuova_id, auth.uid(), email_login, nullif(trim(nome_persona), ''), 'admin', 'attivo');
  insert into public.membri (organizzazione_id, nome, ruolo, stato, segnaposto)
  values (nuova_id, 'Da assegnare', 'membro', 'attivo', true);
  return nuova_id;
end;
$$;
