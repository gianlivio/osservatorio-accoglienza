import raw from "@/data/paesi.json";
import { trovaContorno } from "@/lib/mondo";

export type Continente = "Africa" | "Asia" | "America" | "Europa";
export const CONTINENTI: Continente[] = ["Africa", "Asia", "America", "Europa"];

type PaeseGeo = { nome: string; iso3: string; coordinate?: [number, number]; contorno?: string; continente?: string };
const d = raw as unknown as { coordinate_italia?: [number, number]; contorni?: { versione: string }; paesi: PaeseGeo[] };
export const coordinateItalia = d.coordinate_italia as [number, number];
export const itaContorno = trovaContorno("380");

// Controllo di build: ogni paese ha coordinate valide, un continente e un contorno presente in world-atlas
// (lo stesso controllo è in script/coordinate.mjs).
(function verifica() {
  const errori: string[] = [];
  const ok = (c?: [number, number]) => Array.isArray(c) && c.length === 2 && c.every((x) => typeof x === "number" && isFinite(x)) &&
    Math.abs(c[0]) <= 180 && Math.abs(c[1]) <= 90;
  if (!ok(d.coordinate_italia)) errori.push("Italia: coordinate mancanti o non valide");
  if (!itaContorno) errori.push("Italia: contorno non trovato");
  for (const p of d.paesi) {
    if (!ok(p.coordinate)) errori.push(`${p.nome}: coordinate mancanti o non valide`);
    if (!p.contorno || !trovaContorno(p.contorno)) errori.push(`${p.nome} (${p.iso3}): contorno ${p.contorno} non presente in world-atlas`);
    if (!p.continente || !CONTINENTI.includes(p.continente as Continente)) errori.push(`${p.nome}: continente ${p.continente} non valido`);
  }
  if (errori.length) throw new Error(`Dati geografici non coerenti: ${errori.join("; ")}`);
})();
