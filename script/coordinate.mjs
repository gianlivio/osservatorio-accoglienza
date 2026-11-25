// Aggiunge a sito/data/paesi.json le coordinate di partenza degli archi del globo di /paesi:
// per ogni paese un punto (centroide del poligono principale; se cade fuori dal territorio, il punto interno più vicino),
// calcolato dai contorni di world-atlas (countries-110m, derivato da Natural Earth, pubblico dominio).
// Scrive anche, per ogni paese, il contorno (id numerico ISO 3166-1 in world-atlas, o il nome dove manca l'id) e il continente.
// Uso, dalla radice del repo: node script/coordinate.mjs   (lo chiama anche script/paesi.py)
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";

const require = createRequire(new URL("../sito/package.json", import.meta.url));
const { geoCentroid, geoArea, geoContains, geoBounds } = require("d3-geo");
const { feature } = require("topojson-client");
const versione = JSON.parse(readFileSync(require.resolve("world-atlas/package.json"))).version;
const topo = require("world-atlas/countries-110m.json");

// iso3 -> [id numerico ISO 3166-1 in world-atlas, continente]. Il Kosovo non ha id numerico: si cerca per nome.
const CONTORNO = {
  AFG: ["004", "Asia"], ALB: ["008", "Europa"], DZA: ["012", "Africa"], BGD: ["050", "Asia"], BFA: ["854", "Africa"],
  CIV: ["384", "Africa"], EGY: ["818", "Africa"], SLV: ["222", "America"], ERI: ["232", "Africa"], ETH: ["231", "Africa"],
  GMB: ["270", "Africa"], GEO: ["268", "Asia"], GHA: ["288", "Africa"], GIN: ["324", "Africa"], IND: ["356", "Asia"],
  IRN: ["364", "Asia"], IRQ: ["368", "Asia"], XKX: ["Kosovo", "Europa"], MLI: ["466", "Africa"], MAR: ["504", "Africa"],
  NGA: ["566", "Africa"], PAK: ["586", "Asia"], PER: ["604", "America"], SEN: ["686", "Africa"], SYR: ["760", "Asia"],
  SOM: ["706", "Africa"], LKA: ["144", "Asia"], SDN: ["729", "Africa"], TUN: ["788", "Africa"], UKR: ["804", "Europa"],
  VEN: ["862", "America"], ITA: ["380", "Europa"],
};
const NOME_ATTESO = { "Kosovo": "Kosovo" };

const tutti = feature(topo, topo.objects.countries).features;
const trova = (id) => tutti.find((f) => (/^\d+$/.test(id) ? f.id === id : f.properties.name === id));

function punto(f) {
  // poligono principale: quello di area maggiore
  const poligoni = f.geometry.type === "MultiPolygon" ? f.geometry.coordinates.map((c) => ({ type: "Polygon", coordinates: c })) : [f.geometry];
  const p = poligoni.reduce((a, b) => (geoArea(b) > geoArea(a) ? b : a));
  const c = geoCentroid(p);
  if (geoContains(p, c)) return c.map((x) => Math.round(x * 100) / 100);
  const [[x0, y0], [x1, y1]] = geoBounds(p);
  let migliore = null, d = Infinity;
  for (let x = x0; x <= x1; x += 0.1) for (let y = y0; y <= y1; y += 0.1) {
    const q = [x, y];
    if (!geoContains(p, q)) continue;
    const dd = (x - c[0]) ** 2 + (y - c[1]) ** 2;
    if (dd < d) { d = dd; migliore = q; }
  }
  if (!migliore) throw new Error("nessun punto interno");
  return migliore.map((x) => Math.round(x * 100) / 100);
}

const file = "sito/data/paesi.json";
const dati = JSON.parse(readFileSync(file, "utf8"));
const errori = [];
const nomi = {};
for (const p of dati.paesi) {
  const c = CONTORNO[p.iso3];
  if (!c) { errori.push(`${p.nome}: codice ${p.iso3} senza contorno`); continue; }
  const f = trova(c[0]);
  if (!f) { errori.push(`${p.nome}: contorno ${c[0]} non trovato in world-atlas`); continue; }
  p.coordinate = punto(f); p.contorno = c[0]; p.continente = c[1];
  nomi[p.nome] = f.properties.name;
}
const it = trova(CONTORNO.ITA[0]);
if (!it) errori.push("Italia: contorno non trovato");
if (errori.length) { console.error("Controlli non superati:\n  " + errori.join("\n  ")); process.exit(1); }
dati.coordinate_italia = punto(it);
dati.contorni = { fonte: "world-atlas", versione, file: "countries-110m", origine: "Natural Earth", licenza: "pubblico dominio", url: "https://github.com/topojson/world-atlas" };
writeFileSync(file, JSON.stringify(dati, null, 1) + "\n");
console.log("coordinate scritte per", dati.paesi.length, "paesi; Italia", dati.coordinate_italia);
for (const p of dati.paesi) console.log(" ", p.nome.padEnd(26), nomi[p.nome].padEnd(26), p.coordinate.join(", "), p.continente);
