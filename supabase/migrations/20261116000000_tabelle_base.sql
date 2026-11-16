-- Tabelle di base di Blarmas: organizzazioni, membri, progetti, attività.
-- Parte VUOTO: nessun dato di prova.
-- Ogni dato appartiene a un'organizzazione (colonna organizzazione_id).
-- La sicurezza a livello di riga (RLS) è accesa su tutte le tabelle ma SENZA regole:
-- finché non aggiungiamo le regole (passo 3) nessuno può leggere o scrivere. È voluto.

-- ---------- Organizzazioni ----------
create table public.organizzazioni (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (length(trim(nome)) > 0),
  creata_il timestamptz not null default now()
);

-- ---------- Membri (chi sta in quale organizzazione, e con che ruolo) ----------
create table public.membri (
  id uuid primary key default gen_random_uuid(),
  organizzazione_id uuid not null references public.organizzazioni (id) on delete cascade,
  -- utente_id resta vuoto finché la persona invitata non si registra
  utente_id uuid references auth.users (id) on delete cascade,
  email text not null check (position('@' in email) > 1),
  nome text,
  ruolo text not null default 'membro' check (ruolo in ('admin', 'membro', 'ospite')),
  stato text not null default 'invitato' check (stato in ('attivo', 'invitato')),
  creato_il timestamptz not null default now(),
  -- serve alle tabelle collegate per controllare che l'organizzazione coincida
  unique (id, organizzazione_id)
);

-- La stessa email non può comparire due volte nella stessa organizzazione (maiuscole ignorate)
create unique index membri_email_unica on public.membri (organizzazione_id, lower(email));
-- Una persona registrata non può comparire due volte nella stessa organizzazione
create unique index membri_utente_unico on public.membri (organizzazione_id, utente_id) where utente_id is not null;
create index membri_utente_idx on public.membri (utente_id);

-- ---------- Progetti ----------
create table public.progetti (
  id uuid primary key default gen_random_uuid(),
  organizzazione_id uuid not null references public.organizzazioni (id) on delete cascade,
  nome text not null check (length(trim(nome)) > 0),
  stato text not null default 'In corso' check (stato in ('In corso', 'A rischio', 'Completato')),
  scadenza date,
  creato_il timestamptz not null default now(),
  unique (id, organizzazione_id)
);

create index progetti_organizzazione_idx on public.progetti (organizzazione_id);

-- ---------- Attività ----------
create table public.attivita (
  id uuid primary key default gen_random_uuid(),
  organizzazione_id uuid not null,
  progetto_id uuid not null,
  titolo text not null check (length(trim(titolo)) > 0),
  descrizione text not null default '',
  stato text not null default 'Da fare' check (stato in ('Da fare', 'In corso', 'Fatto')),
  priorita text not null default 'Media' check (priorita in ('Alta', 'Media', 'Bassa')),
  scadenza date,
  etichette text[] not null default '{}',
  assegnatario_id uuid,
  creata_il timestamptz not null default now(),
  -- Il progetto e l'assegnatario devono appartenere alla STESSA organizzazione dell'attività.
  -- Così non si può mai mescolare i dati di due aziende, nemmeno per errore.
  foreign key (progetto_id, organizzazione_id)
    references public.progetti (id, organizzazione_id) on delete cascade,
  foreign key (assegnatario_id, organizzazione_id)
    references public.membri (id, organizzazione_id) on delete set null (assegnatario_id)
);

create index attivita_progetto_idx on public.attivita (progetto_id);
create index attivita_organizzazione_idx on public.attivita (organizzazione_id);
create index attivita_assegnatario_idx on public.attivita (assegnatario_id);

-- ---------- Sicurezza: RLS accesa, nessuna regola ancora ----------
alter table public.organizzazioni enable row level security;
alter table public.membri enable row level security;
alter table public.progetti enable row level security;
alter table public.attivita enable row level security;
