-- Regole di sicurezza (RLS): ognuno vede e modifica SOLO i dati della propria organizzazione.
-- Ruoli:  admin  = può fare tutto nella sua organizzazione
--         membro = può leggere e lavorare su progetti e attività
--         ospite = può solo leggere
-- Chi non ha fatto il login (anon) non ha nessun permesso.

-- ---------- Funzioni di aiuto (in uno schema "private", non raggiungibile dal sito) ----------
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- "Sono un membro attivo di questa organizzazione?"
create function private.sono_membro(org uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.membri
    where organizzazione_id = org and utente_id = (select auth.uid()) and stato = 'attivo'
  );
$$;

-- "Sono admin o membro (quindi posso scrivere)?"
create function private.sono_membro_operativo(org uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.membri
    where organizzazione_id = org and utente_id = (select auth.uid()) and stato = 'attivo'
      and ruolo in ('admin', 'membro')
  );
$$;

-- "Sono admin di questa organizzazione?"
create function private.sono_admin(org uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.membri
    where organizzazione_id = org and utente_id = (select auth.uid()) and stato = 'attivo'
      and ruolo = 'admin'
  );
$$;

revoke all on function private.sono_membro(uuid), private.sono_membro_operativo(uuid), private.sono_admin(uuid) from public, anon;
grant execute on function private.sono_membro(uuid), private.sono_membro_operativo(uuid), private.sono_admin(uuid) to authenticated;

-- ---------- Permessi sulle tabelle (le regole sotto restringono le righe) ----------
-- "anon" (non loggato) non riceve nulla. "authenticated" (loggato) riceve solo quello che serve.
grant select, update on public.organizzazioni to authenticated;
grant select, insert, update, delete on public.membri to authenticated;
grant select, insert, update, delete on public.progetti to authenticated;
grant select, insert, update, delete on public.attivita to authenticated;

-- ---------- Organizzazioni ----------
-- Si creano solo con la funzione crea_organizzazione (più sotto), non con insert diretto.
create policy "vedo la mia organizzazione" on public.organizzazioni
  for select to authenticated using (private.sono_membro(id));

create policy "l'admin modifica la sua organizzazione" on public.organizzazioni
  for update to authenticated
  using (private.sono_admin(id)) with check (private.sono_admin(id));

-- ---------- Membri ----------
create policy "vedo i membri della mia organizzazione" on public.membri
  for select to authenticated using (private.sono_membro(organizzazione_id));

create policy "l'admin invita" on public.membri
  for insert to authenticated with check (private.sono_admin(organizzazione_id));

create policy "l'admin modifica i membri" on public.membri
  for update to authenticated
  using (private.sono_admin(organizzazione_id)) with check (private.sono_admin(organizzazione_id));

create policy "l'admin rimuove i membri" on public.membri
  for delete to authenticated using (private.sono_admin(organizzazione_id));

-- ---------- Progetti ----------
create policy "vedo i progetti della mia organizzazione" on public.progetti
  for select to authenticated using (private.sono_membro(organizzazione_id));

create policy "admin e membri creano progetti" on public.progetti
  for insert to authenticated with check (private.sono_membro_operativo(organizzazione_id));

create policy "admin e membri modificano progetti" on public.progetti
  for update to authenticated
  using (private.sono_membro_operativo(organizzazione_id))
  with check (private.sono_membro_operativo(organizzazione_id));

create policy "solo l'admin elimina progetti" on public.progetti
  for delete to authenticated using (private.sono_admin(organizzazione_id));

-- ---------- Attività ----------
create policy "vedo le attività della mia organizzazione" on public.attivita
  for select to authenticated using (private.sono_membro(organizzazione_id));

create policy "admin e membri creano attività" on public.attivita
  for insert to authenticated with check (private.sono_membro_operativo(organizzazione_id));

create policy "admin e membri modificano attività" on public.attivita
  for update to authenticated
  using (private.sono_membro_operativo(organizzazione_id))
  with check (private.sono_membro_operativo(organizzazione_id));

create policy "admin e membri eliminano attività" on public.attivita
  for delete to authenticated using (private.sono_membro_operativo(organizzazione_id));

-- ---------- Creare la propria organizzazione ----------
-- Chi si registra non appartiene ancora a nessuna organizzazione, quindi non potrebbe crearla
-- con le regole sopra. Questa funzione fa le due cose insieme: crea l'organizzazione
-- e rende admin chi la chiama. L'email viene presa dal login, non da chi chiama.
create function public.crea_organizzazione(nome_organizzazione text, nome_persona text)
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
  return nuova_id;
end;
$$;

revoke all on function public.crea_organizzazione(text, text) from public, anon;
grant execute on function public.crea_organizzazione(text, text) to authenticated;
