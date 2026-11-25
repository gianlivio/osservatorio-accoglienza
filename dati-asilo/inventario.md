# Paesi di provenienza: inventario delle fonti (Eurostat, EUAA)

Raccolta e verifica, nessuna modifica al sito. Generato il 25/11/2026. Nessuna stima, nessuna lettura del contenuto dei rapporti. File grezzi in questa cartella: `migr_asyappctza.json`, `migr_asydcfsta.json`, `migr_asyunaa.json` (API di diffusione Eurostat, `geo=IT`, JSON-stat, tutte le dimensioni).

## 1. Elenco dei paesi (24)

Unione di due serie. **Minori** = prime 10 cittadinanze dei minori presenti per anno, da `sito/data/msna-cittadinanza.json` (2016–2025, fonte Ministero del Lavoro). **Sbarchi** = prime 10 nazionalità degli sbarcati per anno, da `dati-msna-cittadinanza/inventario.md` tab. B1 (Ministero dell'Interno, 2017–2026; il 2026 è l'anno in corso, cruscotto del 23/11/2026; nessuna tabella per il 2016). Le prime 10 sono prese nell'ordine delle fonti; nel 2025 e nel 2026 i cruscotti hanno 15 righe, qui se ne usano 10. Un paese «solo sbarchi» non compare mai tra le prime 10 dei minori presenti, e viceversa.

| Paese | Codice Eurostat | Minori presenti (anni) | Sbarchi (anni) |
|---|---|---|---|
| Afghanistan | AF | 2020, 2021, 2022 | 2020, 2022 |
| Albania | AL | 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025 | — |
| Algeria | DZ | — | 2018, 2019, 2020, 2025, 2026 |
| Bangladesh | BD | 2016, 2017, 2019, 2020, 2021, 2022, 2024, 2025 | 2017, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 |
| Burkina Faso | BF | 2023 | 2023 |
| Costa d'Avorio | CI | 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025 | 2017, 2018, 2019, 2020, 2021, 2022, 2023 |
| Egitto | EG | 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025 | 2020, 2021, 2022, 2023, 2024, 2025, 2026 |
| Eritrea | ER | 2016, 2017, 2018, 2021 | 2017, 2018, 2021, 2022, 2024, 2025, 2026 |
| Etiopia | ET | — | 2025, 2026 |
| Gambia | GM | 2016, 2017, 2018, 2019, 2022, 2023, 2024, 2025 | 2024 |
| Guinea | GN | 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025 | 2017, 2018, 2019, 2021, 2022, 2023, 2024 |
| Iran | IR | — | 2019, 2020, 2021, 2022, 2025 |
| Iraq | IQ | — | 2018, 2019, 2021 |
| Kosovo | XK | 2019, 2020 | — |
| Mali | ML | 2016, 2017, 2018, 2023, 2024 | 2017, 2018, 2023, 2024, 2026 |
| Marocco | MA | — | 2017, 2020, 2021 |
| Nigeria | NG | 2016, 2017, 2018 | 2017, 2018 |
| Pakistan | PK | 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025 | 2018, 2019, 2020, 2022, 2023, 2024, 2025, 2026 |
| Senegal | SN | 2016, 2017, 2018, 2019 | 2017 |
| Siria | SY | — | 2021, 2022, 2023, 2024 |
| Somalia | SO | 2020, 2021, 2025 | 2019, 2025, 2026 |
| Sudan | SD | — | 2017, 2018, 2019, 2020, 2023, 2024, 2025, 2026 |
| Tunisia | TN | 2019, 2020, 2021, 2022, 2023, 2024, 2025 | 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026 |
| Ucraina | UA | 2022, 2023, 2024, 2025 | — |

Note: nei minori presenti 2023–2025 le fonti (semestrali) riportano 7–10 cittadinanze citate nel testo, non tabelle complete; per il 2023 il JSON ne ha 12, per il 2024 12, per il 2025 10. Kosovo è «Kosovo*» in Eurostat. Costa d'Avorio è «Côte d'Ivoire».

## 2. Eurostat (solo Italia, `geo=IT`, dati annuali)

Metodo: API di diffusione `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/<codice>?format=JSON&lang=EN&geo=IT`, un solo download per dataset, nessun blocco incontrato. Il JSON-stat non riporta simboli: i valori assenti (':') non compaiono tra i valori e non ci sono flag di stato (`status` vuoto).

| Dataset | Titolo | Anni coperti | Aggiornamento dati | Dimensioni | Valori |
|---|---|---|---|---|---|
| `migr_asyappctza` | Richiedenti asilo per tipo, cittadinanza, età e sesso | 2008–2025 | 2026-09-03 | applicant (TOTAL, FRST, SSEQ), sex, age (8 classi), 206 cittadinanze | 259.764 |
| `migr_asydcfsta` | Decisioni di prima istanza per tipo di decisione, cittadinanza, età e sesso | 2008–2025 | 2026-10-28 | decision (TOTAL, POS, POS_RFG, POS_HUM, POS_SPROT, NEG), sex, age (8 classi), 206 cittadinanze | 711.936 |
| `migr_asyunaa` | Richiedenti asilo minori non accompagnati per cittadinanza, età e sesso | 2008–2025 | 2026-10-27 | sex, age (TOTAL, Y_LT14, Y14-15, Y16-17, UNK), 206 cittadinanze | 74.080 |

Metadati Eurostat: `https://ec.europa.eu/eurostat/cache/metadata/en/migr_asyapp_esms.htm` (richiedenti e minori non accompagnati), `…/migr_asydec_esms.htm` (decisioni). DOI: 10.2908/MIGR_ASYAPPCTZA, 10.2908/MIGR_ASYDCFSTA, 10.2908/MIGR_ASYUNAA.

**Presenza dei 24 paesi (sesso totale, età totale):** tutti e 24 sono presenti con un valore per ciascuno degli 11 anni 2015–2025, in tutti e tre i dataset (nessun valore mancante o riservato in quel perimetro; per `migr_asyappctza` tipo richiedente TOTAL, per `migr_asydcfsta` tipo di decisione TOTAL). Non ho verificato i valori mancanti per le altre combinazioni di sesso/età né per gli anni 2008–2014.

**Arrotondamento:** nelle decisioni (`migr_asydcfsta`) i 199 totali per cittadinanza con valore nel 2025 sono tutti multipli di 5. Eurostat non lo indica nel file scaricato; le differenze di cui sotto sono compatibili con questo. Non ho letto la nota metodologica per confermare la regola di arrotondamento.

**Controllo, decisioni 2025 (cittadinanza = TOTALE):** totale decisioni 104.560; positive (POS) 31.365 + negative (NEG) 73.200 = 104.565. **Non torna: differenza di 5.** Le positive tornano: 5.965 (status di rifugiato) + 13.945 (motivi umanitari) + 11.455 (protezione sussidiaria) = 31.365. Per cittadinanza, nel 2025 il totale differisce da POS+NEG in 19 casi su 199 (massimo 5; es. Pakistan 10.555 contro 3.430 + 7.120 = 10.550) e POS differisce dalla somma dei tre tipi in 26 casi (es. Pakistan 3.430 contro 385 + 1.965 + 1.085 = 3.435). Negli anni 2015–2025 il totale coincide con POS+NEG in 8 anni su 11 (differenza di 5 nel 2022, 2024, 2025). La somma delle cittadinanze con codice a due lettere nel 2025 (104.265) è inferiore al totale (104.560) di 295; le voci aggregate (es. sconosciuta 215, apolidi 65) non sono nella somma.

**Condizioni di riuso** (pagina «Copyright notice and free re-use of data», `https://ec.europa.eu/eurostat/web/main/help/copyright-notice`): «The copyright for the editorial content of this website, which is owned by the EU, is licensed under the Creative Commons Attribution 4.0 International licence. This means that you can re-use the content provided you acknowledge the source and indicate any changes you have made.» Inoltre: «Reuse of statistical data, metadata, publications, and other dissemination tools published on this website for commercial or non-commercial purposes is authorised provided the source is acknowledged. The reuse policy of the European Commission is implemented by the Decision of 12 December 2011.» E: «When reuse involves translations of publications or modifications to the data or text, this must be stated clearly to the end user of the information. A disclaimer regarding the non-responsibility of Eurostat shall be included.» L'uso non commerciale senza restrizioni vale per i dati di fonti diverse da Eurostat e per i dati di paesi non UE/EFTA/candidati: non riguarda i dati sull'Italia.

## 3. EUAA: rapporti COI dal 2023 in poi

Metodo: il portale COI (`coi.euaa.europa.eu`) ha la ricerca in un modulo ASP.NET con invio POST e non l'ho usato. Ho letto invece l'elenco delle pubblicazioni di `www.euaa.europa.eu/publications` filtrato sulla categoria «Country of Origin Information» (25 pagine, 247 pubblicazioni dal 06/02/2022 al 16/11/2026, date di pubblicazione del sito) e, per ogni paese, la ricerca per titolo su tutte le categorie. Le Country Guidance sono una categoria a parte e non sono contate. Un «rapporto» è una pubblicazione il cui titolo inizia con «COI Report» (qui compresi «Country Focus» e «Security Situation»); le «COI Query» (risposte a singole domande) sono contate a parte. Non conta il contenuto.

| Paese | Rapporti COI dal 2023 (data, titolo) | COI Query dal 2023 |
|---|---|---|
| Afghanistan | 2026-01-22 — [COI Report - Afghanistan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-afghanistan-country-focus-2)<br>2024-11-11 — [COI Report - Afghanistan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-afghanistan-country-focus-1)<br>2023-12-05 — [COI Report – Afghanistan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-afghanistan-country-focus-0) | 3 |
| Albania | **nessuno trovato** | 0 |
| Algeria | **nessuno trovato** | 0 |
| Bangladesh | 2025-08-05 — [COI Report - Bangladesh: Country Focus](https://www.euaa.europa.eu/publications/coi-report-bangladesh-country-focus-0)<br>2024-07-11 — [COI Report – Bangladesh: Country Focus](https://www.euaa.europa.eu/publications/coi-report-bangladesh-country-focus) | 4 |
| Burkina Faso | **nessuno trovato** | 0 |
| Costa d'Avorio | **nessuno trovato** | 0 |
| Egitto | **nessuno trovato** | 0 |
| Eritrea | **nessuno trovato** | 0 |
| Etiopia | **nessuno trovato** | 0 |
| Gambia | **nessuno trovato** | 0 |
| Guinea | **nessuno trovato** | 3 |
| Iran | 2024-06-27 — [COI Report – Iran: Country Focus](https://www.euaa.europa.eu/publications/coi-report-iran-country-focus)<br>2023-01-11 — [COI Report - Iran: Situation of Afghan refugees](https://www.euaa.europa.eu/publications/coi-report-iran-situation-afghan-refugees) | 15 |
| Iraq | 2026-11-16 — [Iraq: Security Situation](https://www.euaa.europa.eu/publications/iraq-security-situation)<br>2026-11-16 — [Iraq: Country Focus](https://www.euaa.europa.eu/publications/iraq-country-focus)<br>2025-10-08 — [COI Report - Iraq: Country Focus](https://www.euaa.europa.eu/publications/coi-report-iraq-country-focus-0)<br>2024-05-28 — [COI Report: Iraq – Security Situation](https://www.euaa.europa.eu/publications/coi-report-iraq-security-situation)<br>2024-05-28 — [COI Report – Iraq: Country Focus](https://www.euaa.europa.eu/publications/coi-report-iraq-country-focus)<br>2023-04-14 — [COI Report – Iraq: Arab Tribes and Customary Law](https://www.euaa.europa.eu/publications/coi-report-iraq-arab-tribes-and-customary-law) | 7 |
| Kosovo | **nessuno trovato** | 0 |
| Mali | **nessuno trovato** | 0 |
| Marocco | **nessuno trovato** | 0 |
| Nigeria | 2025-11-03 — [COI Report - Nigeria: Security Situation](https://www.euaa.europa.eu/publications/coi-report-nigeria-security-situation-0)<br>2025-11-03 — [COI Report - Nigeria: Country Focus](https://www.euaa.europa.eu/publications/coi-report-nigeria-country-focus-1)<br>2024-07-12 — [COI Report – Nigeria: Country Focus](https://www.euaa.europa.eu/publications/coi-report-nigeria-country-focus) | 18 |
| Pakistan | 2026-05-20 — [COI Report - Pakistan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-pakistan-country-focus-1)<br>2024-12-17 — [COI Report – Pakistan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-pakistan-country-focus) | 10 |
| Senegal | **nessuno trovato** | 0 |
| Siria | 2026-07-13 — [COI Report -Syria: Security Situation](https://www.euaa.europa.eu/publications/coi-report-syria-security-situation-5)<br>2026-07-13 — [COI Report - Syria: Country Focus](https://www.euaa.europa.eu/publications/coi-report-syria-country-focus-3)<br>2025-07-07 — [COI Report - Syria: Country Focus](https://www.euaa.europa.eu/publications/coi-report-syria-country-focus-1)<br>2025-03-25 — [COI Report - Syria: Country Focus](https://www.euaa.europa.eu/publications/coi-report-syria-country-focus)<br>2024-10-22 — [COI Report - Syria: Security Situation](https://www.euaa.europa.eu/publications/coi-report-syria-security-situation-4)<br>2023-10-09 — [COI Report – Syria: Country Focus](https://www.euaa.europa.eu/publications/coi-report-syria-country-focus-0) | 5 |
| Somalia | 2026-05-29 — [COI Report - Somalia: Security Situation](https://www.euaa.europa.eu/publications/coi-report-somalia-security-situation-4)<br>2026-05-29 — [COI Report - Somalia: Displacement in Mogadishu](https://www.euaa.europa.eu/publications/coi-report-somalia-displacement-mogadishu)<br>2025-05-26 — [COI Report - Somalia: Country Focus](https://www.euaa.europa.eu/publications/coi-report-somalia-country-focus)<br>2025-05-26 — [COI Report -  Somalia: Security Situation](https://www.euaa.europa.eu/publications/coi-report-somalia-security-situation-3)<br>2023-02-23 — [COI Report – Somalia: Security Situation](https://www.euaa.europa.eu/publications/coi-report-somalia-security-situation)<br>2023-02-02 — [COI Report – Somalia: Defection, Desertion and Disengagement from Al-Shabaab](https://www.euaa.europa.eu/publications/coi-report-somalia-defection-desertion-and-disengagement-al-shabaab) | 3 |
| Sudan | 2026-10-20 — [COI Report - Sudan: Security Situation](https://www.euaa.europa.eu/publications/coi-report-sudan-security-situation-0)<br>2026-08-25 — [COI Report - Sudan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-sudan-country-focus-1)<br>2025-02-11 — [COI Report – Sudan: Security Situation](https://www.euaa.europa.eu/publications/coi-report-sudan-security-situation)<br>2025-02-11 — [COI Report - Sudan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-sudan-country-focus-0)<br>2024-04-26 — [COI Report – Sudan: Country Focus](https://www.euaa.europa.eu/publications/coi-report-sudan-country-focus) | 2 |
| Tunisia | **nessuno trovato** | 0 |
| Ucraina | **nessuno trovato** | 1 |

Altri documenti EUAA che citano un paese ma non sono rapporti COI (categoria diversa, non contati): Egitto: «Migration Drivers Report: Egypt as a Country of Origin» (29/07/2022, quindi anteriore al 2023) e «Roadmap for Cooperation between the EUAA and EGYPT» (16/06/2025); Bangladesh: due «MedCOI Topical Report» del 30/05/2024 (Hepatitis, Psychiatry); Albania e Kosovo: roadmap di cooperazione e valutazioni esterne; Ucraina: indagini «Surveys of Arriving Migrants from Ukraine» e altri rapporti sul tema dell'accoglienza (2023–2026). Le Country Guidance 2023–2026 esistono per Afghanistan, Iran, Iraq, Nigeria, Pakistan, Siria, Somalia e Sudan: non sono incluse nella tabella.

**Verifica fatta e da ripetere:** l'elenco della categoria COI è paginato (10 per pagina). La ricerca per titolo, per ogni paese, restituisce solo la prima pagina (10 risultati): dove mostra 10 elementi dal 2023 (Iran, Iraq, Nigeria, Pakistan, Siria, Somalia, Ucraina) può essere troncata, ma la tabella sopra si basa sull'elenco completo della categoria COI, non su quella ricerca. Il titolo «Iraq: Security Situation» / «Iraq: Country Focus» del 16/11/2026 non ha il prefisso «COI Report» ma è nella categoria COI e l'ho contato come rapporto.

**Condizioni di riuso dei testi EUAA** (due pagine, con testi diversi):
- Sito EUAA, `https://www.euaa.europa.eu/legal-notice`: «Copyright notice: © European Union Agency for Asylum, 2022. Reproduction is authorised, provided the source is acknowledged, save otherwise stated.»
- Portale COI, `https://coi.euaa.europa.eu/legalnotice`: «© European Asylum Support Office, 2016-2019. Reproduction is authorised, provided the source is acknowledged, save otherwise stated. Reproduction as part of a commercial activity requires permission.» Aggiunge che l'EUAA non detiene il copyright del materiale di terzi elencato sul portale e che loghi e marchi EUAA sono vietati senza permesso scritto.
- Le due pagine non coincidono sull'uso commerciale. Non ho verificato se i singoli rapporti riportino un avviso di copyright proprio (la pagina del sito rinvia con «save otherwise stated»).

## 4. Tabella riassuntiva

| Paese | Presente in minori/sbarchi | Dati Eurostat (richiedenti, decisioni, minori non acc.) | Rapporto EUAA (COI Report dal 2023: più recente, numero) |
|---|---|---|---|
| Afghanistan | minori + sbarchi | sì, 2015–2025 | sì, 2026-01-22 (3) |
| Albania | minori | sì, 2015–2025 | no |
| Algeria | sbarchi | sì, 2015–2025 | no |
| Bangladesh | minori + sbarchi | sì, 2015–2025 | sì, 2025-08-05 (2) |
| Burkina Faso | minori + sbarchi | sì, 2015–2025 | no |
| Costa d'Avorio | minori + sbarchi | sì, 2015–2025 | no |
| Egitto | minori + sbarchi | sì, 2015–2025 | no |
| Eritrea | minori + sbarchi | sì, 2015–2025 | no |
| Etiopia | sbarchi | sì, 2015–2025 | no |
| Gambia | minori + sbarchi | sì, 2015–2025 | no |
| Guinea | minori + sbarchi | sì, 2015–2025 | no |
| Iran | sbarchi | sì, 2015–2025 | sì, 2024-06-27 (2) |
| Iraq | sbarchi | sì, 2015–2025 | sì, 2026-11-16 (6) |
| Kosovo | minori | sì, 2015–2025 | no |
| Mali | minori + sbarchi | sì, 2015–2025 | no |
| Marocco | sbarchi | sì, 2015–2025 | no |
| Nigeria | minori + sbarchi | sì, 2015–2025 | sì, 2025-11-03 (3) |
| Pakistan | minori + sbarchi | sì, 2015–2025 | sì, 2026-05-20 (2) |
| Senegal | minori + sbarchi | sì, 2015–2025 | no |
| Siria | sbarchi | sì, 2015–2025 | sì, 2026-07-13 (6) |
| Somalia | minori + sbarchi | sì, 2015–2025 | sì, 2026-05-29 (6) |
| Sudan | sbarchi | sì, 2015–2025 | sì, 2026-10-20 (5) |
| Tunisia | minori + sbarchi | sì, 2015–2025 | no |
| Ucraina | minori | sì, 2015–2025 | no |

## 5. Punti in cui mi sono fermato o che restano aperti

- Nessun sito ha bloccato i download. Il portale COI (`coi.euaa.europa.eu`) non è stato interrogato per la ricerca (modulo POST): usato l'elenco pubblico delle pubblicazioni sul sito principale.
- Eurostat: il totale delle decisioni 2025 non coincide con POS+NEG (differenza di 5), probabilmente per l'arrotondamento a multipli di 5 (non verificato sulla nota metodologica).
- Eurostat: anni 2008–2014 e combinazioni di sesso/età non controllati per valori mancanti.
- Una prima esecuzione del download delle ricerche EUAA è stata interrotta dal sistema e rifatta in blocchi più piccoli; non ci sono dati parziali nell'inventario.
