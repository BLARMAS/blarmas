# Flusso dei rami (branch)

| Ramo | A cosa serve |
|---|---|
| `develop` | Si lavora qui ogni giorno. È il ramo predefinito. |
| `staging` | Prova finale prima di pubblicare (Vercel in anteprima, database Supabase di prova). |
| `production` | Il sito vero usato dai clienti (Vercel in produzione, database Supabase vero). |
| `master` | Ultimo stato stabile, di riferimento. Non è collegato a nessun ambiente. |

Il percorso è sempre in un verso solo: `develop` → `staging` → `production`.

## Regole
- Non si lavora direttamente su `staging` e `production`: ci si arriva solo unendo il ramo precedente.
- Una novità si prova prima in locale, poi su `develop`, poi su `staging`, e solo alla fine su `production`.
- Niente commit né push senza chiedere (regola del progetto).
- Il ramo `main` non esiste più: è stato rinominato `master`.
