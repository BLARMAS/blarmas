@AGENTS.md

# Blarmas

Gestionale di progetti stile Asana/Trello per project manager, pensato come SaaS B2B per aziende. Interfaccia in italiano.

Dettagli: grafica in `docs/DESIGN.md`, funzioni e ordine di sviluppo in `docs/FUNZIONALITA.md`.

## Stack

Next.js (App Router, TypeScript), Tailwind CSS, Supabase (database, login, Row Level Security, regione UE), Vercel. Per ora sviluppo solo in locale.

## Regole

- Spiega in italiano, in modo semplice: chi sviluppa è alle prime armi con React.
- Non fare commit né push senza chiedere.
- Nessun dato personale nel codice, nei file o nei commit.
- Nessun segreto nel codice: chiavi e password in `.env.local`, mai committato.
- Modello dati multi-organizzazione: ogni dato appartiene a un'organizzazione; ruoli admin / membro / ospite; Row Level Security.
- Codice semplice, componenti piccoli e riutilizzabili.
- Prima di ogni passo importante proponi un piano breve e aspetta l'ok.
- Accessibilità: `button` e `a` veri, `label` sui campi, contrasto almeno 4.5:1, layout utilizzabile anche su schermo stretto.
