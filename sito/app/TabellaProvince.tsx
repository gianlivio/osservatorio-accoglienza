"use client";
import { useState } from "react";
import Link from "next/link";
import { slug, euro, anni, type Provincia, type Blocco } from "@/lib/dati";

type Campo = "provincia" | "affidamenti" | "quota_diretti" | "importo_mediano" | "enti_gestori";
const COLONNE: { campo: Campo; testo: string; num: boolean }[] = [
  { campo: "provincia", testo: "Provincia", num: false },
  { campo: "affidamenti", testo: "Affidamenti", num: true },
  { campo: "quota_diretti", testo: "Diretti", num: true },
  { campo: "importo_mediano", testo: "Importo mediano", num: true },
  { campo: "enti_gestori", testo: "Enti gestori", num: true },
];

export default function TabellaProvince({ province }: { province: Provincia[] }) {
  const [periodo, setPeriodo] = useState<string>("tutti");
  const [campo, setCampo] = useState<Campo>("affidamenti");
  const [cresc, setCresc] = useState(false);

  const dato = (p: Provincia): Blocco | null =>
    periodo === "tutti" ? p.totale : p.per_anno[periodo];

  function valore(p: Provincia, c: Campo): string | number {
    if (c === "provincia") return p.provincia;
    const b = dato(p);
    return b ? (b[c] ?? -1) : -1;
  }

  function ordina(c: Campo) {
    if (c === campo) setCresc(!cresc);
    else { setCampo(c); setCresc(c === "provincia"); }
  }

  const righe = [...province]
    .filter((p) => dato(p) !== null)
    .sort((a, b) => {
      const x = valore(a, campo), y = valore(b, campo);
      const d = typeof x === "string" ? x.localeCompare(y as string, "it") : (x as number) - (y as number);
      return cresc ? d : -d;
    });

  return (
    <>
      <div className="periodi" role="group" aria-label="Periodo">
        {["tutti", ...anni].map((a) => (
          <button key={a} type="button"
            className={"periodo" + (periodo === a ? " attivo" : "")}
            onClick={() => setPeriodo(a)}>
            {a === "tutti" ? `${anni[0]}–${anni[anni.length - 1]}` : a}
          </button>
        ))}
        <span className="conteggio-prov">{righe.length} province</span>
      </div>

      <table className="tabella">
        <caption className="sr-only">Elenco delle province con numero di affidamenti, quota diretti, importo mediano ed enti gestori</caption>
        <thead>
          <tr>{COLONNE.map((c) => (
            <th key={c.campo} className={c.num ? "num" : undefined}>
              <button type="button" className={"ordina" + (campo === c.campo ? " attiva" : "")}
                onClick={() => ordina(c.campo)}
                aria-sort={campo === c.campo ? (cresc ? "ascending" : "descending") : "none"}>
                {c.testo}<span className="freccia">{campo === c.campo ? (cresc ? "↑" : "↓") : "↕"}</span>
              </button>
            </th>
          ))}</tr>
        </thead>
        <tbody>
          {righe.map((p) => {
            const b = dato(p)!;
            return (
              <tr key={p.provincia}>
                <td><Link href={`/provincia/${slug(p.provincia)}`} className="nome-prov">{p.provincia}</Link></td>
                <td className="num">{b.affidamenti}</td>
                <td className="num">{b.quota_diretti}%</td>
                <td className="num">{euro(b.importo_mediano)}</td>
                <td className="num">{b.enti_gestori}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
