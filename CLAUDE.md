# Osservatorio Accoglienza

Sito statico (osservatorioaccoglienza.org) che ricostruisce dai dati aperti ANAC i contratti pubblici per l'accoglienza dei migranti, provincia per provincia e ente per ente, dal 2015.
Affianca i dati sui centri (Centri d'Italia, CC BY 4.0) e sui minori non accompagnati (Ministero del Lavoro). Next.js 16 su Vercel; testi, commit e nomi in italiano.

## Struttura
- `script/estrai2.py`: filtra un file CIG mensile ANAC (CPV, FORTI/DEBOLI/VETO, esclusione della sola formazione); scrive `accoglienza_ANNO_MM.csv`.
- `script/costruisci.py`: unisce estratti, aggiudicazioni e aggiudicatari; produce tutti i JSON e i CSV del sito.
- `script/centri.py`: aggrega Centri d'Italia (CAS, prima accoglienza, SAI) per provincia e anno.
- `script/estrai_msna.py`: estrae i minori non accompagnati dai PDF del Ministero in `sito/data/msna.json`.
- `script/esclusi.csv`: CIG esclusi a mano (cig, motivo). `unisci.py`, `consolida.py`, `aggiudicatari.py`: analisi su un solo anno, fuori dalla pipeline.
- `output/`: versionati solo gli estratti mensili `accoglienza_ANNO_MM.csv`; i `*_completo.csv` sono ignorati.
- `dati-grezzi/`, `dati-centri/`, `dati-msna*/`, `dati-istat/`: non versionate (ANAC, Centri d'Italia, PDF del Ministero).
- `.github/workflows/aggiorna.yml`: il 25 di ogni mese apre una issue con i comandi di aggiornamento.
- `sito/app/`: pagine `/`, `/che-cose`, `/minori`, `/metodologia`, `/provincia/[slug]` (con `feed.xml`), `/ente/[slug]`, `/feed.xml`, `/ricerca.json`, `sitemap.ts`, `robots.ts`; `Ricerca.tsx` è l'unico componente caricato dalla home oltre alla tabella.
- `sito/lib/`: `dati.ts` (tipi, `slug`, `nomeProvincia`, `nItal`, `euro`), `enti.ts`, `centri.ts`, `regioni.ts` (provincia→regione), `nomi.ts` (`nomeEnte`), `jsonld.ts`, `metadati.ts`, `feed.ts`.
- `sito/data/`: `province-lite.json` (totali e anni per provincia, caricato dalla home), `provincia/<slug>.json`, `ente/<slug>.json` + `enti.json`, `centri.json`, `msna.json`. `sito/public/dati/`: CSV scaricabili (uno per provincia, `contratti.csv`).

## Rigenerare i dati (dalla radice del repo)
- `python3 script/costruisci.py`: legge `output/accoglienza_*_MM.csv` e gli zip in `dati-grezzi/` (aggiornamenti mensili più recenti del file completo); scrive `sito/data/province-lite.json`, `provincia/`, `ente/`, `enti.json` e `sito/public/dati/`. Salta i CIG di `script/esclusi.csv` e i CIG ripetuti (vale la prima riga); il campo `aggiornato` è la data degli archivi letti.
- `python3 script/centri.py`: legge i CSV in `dati-centri/`, scrive `sito/data/centri.json`; si ferma se le presenze 2024 di CAS e prima accoglienza non coincidono con quelle pubblicate.
- `python3 script/estrai_msna.py`: `dati-msna/*.pdf` → `sito/data/msna.json`.
- Dopo la rigenerazione committare i dati in un commit separato dal codice.

## Decisioni di metodo da non toccare
- Procedura: `modalita()` in `costruisci.py` classifica ogni contratto in diretto, negoziata, gara (più un residuo "altro"); "senza gara" = affidamento diretto.
- Dal 2024 entrano in archivio contratti di piccolo importo: gli anni non sono confrontabili tra loro. Il confronto corretto è tutti i contratti contro quelli da 40.000 € in su; esiti attendibili solo dal 2024 (`ANNI_ESITO`).
- I corsi di formazione professionale non contano come accoglienza (`solo_formazione` in `estrai2.py`), salvo se uniti a ospitalità.
- Falsi positivi esclusi a mano in `script/esclusi.csv`, con il motivo; per i mesi futuri si aggiunge anche un VETO in `estrai2.py`. Gli estratti in `output/` non si modificano.
- Enti per codice fiscale: 11 cifre = impresa o ente (hanno una pagina `/ente/`), 16 caratteri = persona fisica (esclusa), altri formati o assenti = contati per nome. Il nome è il più frequente per quel codice.
- Performance: la home carica solo `province-lite.json`; il dettaglio di provincia, ente e centri si carica a build time nelle rispettive pagine, mai nella home. `Ricerca.tsx` non importa `lib/dati` e scarica `/ricerca.json` al primo focus.
- Centri d'Italia: SAI dal file dei progetti; CAS e prima accoglienza sommando tutte le righe, righe ripetute comprese, come la fonte.

## Registro del copy
- Preciso, piano, senza interpretazioni (niente "solo", "elevato", "preoccupante"). Modello di voce: la pagina `/che-cose`.
- Cifre solo dai dati, mai scritte a mano: si leggono da JSON o da `nItal`/`euro` (separatore delle migliaia sempre attivo).
- Dove un dato manca, si dice ("n.d.", "nessun centro nei dati"), non si mette 0.

## SEO
- Title e description di ogni pagina passano da `metadatiPagina()` in `sito/lib/metadati.ts` (con og e twitter, `/og.png`); un `openGraph` di pagina sostituisce quello del layout, quindi va sempre ripetuto per intero. Un `alternates` di pagina sostituisce il canonical del layout: va ripetuto `canonical: "./"`.
- Description entro 155 caratteri; quelle di provincia e di ente sono generate dai dati.
- JSON-LD con `app/JsonLd.tsx` e `lib/jsonld.ts` (creatore, licenza CC BY-SA 4.0, `fonteAnac`, `fonteCentri`, `breadcrumb`, `distribuzioneCsv`). Nessun `WebSite`/`SearchAction`.
- `app/sitemap.ts`: `lastmod` dal campo `aggiornato`; gli enti con almeno 2 contratti.

## Regole di lavoro
- Prima leggere il codice e i dati, poi proporre; ambiguità o dati mancanti si segnalano, non si inventano.
- Un commit per modifica; messaggi in italiano.
- `cd sito && npm run build` senza errori prima di dichiarare finito.
- Mai `git push`, salvo richiesta esplicita: di norma lo fa l'autore.
