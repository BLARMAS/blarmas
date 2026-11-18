# Checklist di sviluppo

Si spunta man mano. Ogni cosa nel progetto deve corrispondere a una grafica in `docs/design/png`.
Le pagine hanno la grafica fatta e usano i dati veri di Supabase. Report, Template e Integrazioni mostrano "Disponibile prossimamente".

## Passo 1 — Layout comune e stile base
- [x] Stile base: Inter, colori, forme (`app/globals.css`)
- [x] Barra admin + sidebar (`02-home.png`)

## Passo 2 — Pagina di accesso
- [x] Grafica del login in `/` (`01-login.png`)
- [x] Schermata "Password dimenticata" in `/password-dimenticata` (senza grafica di riferimento)
- [x] Schermata "Crea la tua organizzazione" in `/crea-organizzazione` (senza grafica di riferimento)
- [x] Modulo di accesso con controlli (email valida, password compilata), senza verifica dell'account
- [x] Login, recupero password e creazione organizzazione veri (Supabase)

## Passo 3 — Progetti e bacheca
- [x] Progetti (`03-progetti.png`)
- [x] Bacheca Kanban con trascinamento (`04-bacheca-kanban.png`)
- [x] "Nuovo progetto" con modulo

## Passo 4 — Supabase
- [x] Login, organizzazioni, database, Row Level Security
- [x] Sostituire i dati finti con quelli veri (file `app/lib/dati.ts` eliminato)

## Passo 5 — Attività complete
- [x] Lista con ricerca e filtri (`05-lista-attivita.png`)
- [x] Dettaglio in pannello laterale (`06-dettaglio-attivita.png`)
- [x] "Nuova attività" con modulo
- [x] Salvare progetti e attività nel database
- [x] Modifica ed eliminazione di progetti e attività (l'eliminazione dei progetti solo per l'admin)
- [ ] Sotto-attività e commenti nel dettaglio (servono due tabelle)
- [ ] Allegati nel dettaglio

## Passo 6 — Home, le mie attività, team
- [x] Home (`02-home.png`)
- [x] Le mie attività (`07-mie-attivita.png`)
- [x] Team (`08-team.png`)
- [x] "Invita persone" con modulo (la persona viene registrata come invitata, senza email)
- [ ] Inviti veri con email
- [x] Modifica ed eliminazione delle persone del team (solo admin), stato Sospeso, persona segnaposto "Da assegnare", ultimo admin protetto
- [x] Menu "+ Nuovo" in alto (progetto, attività, invito) e "+ Aggiungi" nei promemoria
- [x] Profilo `/profilo` e menu sul cerchio "AS" (senza grafica di riferimento)
- [x] Profilo: nome, password e uscita vere (Supabase)

## Passo 7 — Versione 2
- [x] Calendario (`09-calendario.png`)
- [x] Timeline (`10-timeline.png`)
- [x] Report e tempo (`11-report-tempo.png`)
- [x] Template (`12-template.png`)
- [x] Integrazioni (`13-integrazioni.png`)
- [x] Calendario, Timeline: calcolati dalle attività e dai progetti
- [ ] Report e tempo (servono registro ore e date di chiusura), Template, Integrazioni, Notifiche

## Date
- [x] Data di inizio (facoltativa) di progetti e attività; la timeline parte da lì

## Carico di lavoro
- [x] Pagina "Carico di lavoro": impegno di ogni persona per periodo e per progetto, con dettaglio delle attività
- [x] Scheda "Team" dentro il progetto
- [x] Calendario del carico: ore previste per persona e per giorno (8 h = giornata piena)
- [ ] Capacità diversa per persona (part-time, ferie)

## Effort
- [x] Effort di progetti e attività (gg / h), con ore consumate per attività e ore restanti del progetto calcolate

## App installabile (PWA)
- [x] Manifest, icone e impostazioni per iPhone e Android
- [ ] Funzionamento senza internet (service worker e dati salvati sul telefono)
- [ ] Notifiche push
