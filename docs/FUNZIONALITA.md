# Funzionalità e ordine di sviluppo

## Versione 1

- Accesso e organizzazioni.
- Progetti.
- Attività: titolo, descrizione, assegnatario, scadenza, priorità, etichette.
- Bacheca Kanban con trascinamento e vista a lista.
- Dettaglio attività in pannello laterale: sotto-attività, commenti, allegati.
- Le mie attività.
- Home con box calendario, promemoria e progetti in scadenza questa settimana.
- Team e inviti.
- Notifiche base.
- Ricerca e filtri.

## Versione 2

- Calendario completo.
- Timeline con dipendenze.
- Report e tempo.
- Template di progetto.
- Integrazioni: Slack, Google Calendar, Google Drive, email.

## Ordine di sviluppo

1. Layout comune (barra admin + sidebar) e stile base con dati finti.
2. Pagina di accesso.
3. Progetti e bacheca con dati finti.
4. Collegamento a Supabase (login, organizzazioni, database).
5. Attività complete, lista, dettaglio.
6. Home, le mie attività, team.
7. Versione 2.

## Modello dati

Multi-organizzazione: ogni dato appartiene a un'organizzazione. Ruoli: admin / membro / ospite. Protezione con Row Level Security.
