"use client";
import { useState } from "react";
import Link from "next/link";
import { nItal, pct } from "@/lib/dati";
import type { Paese } from "@/lib/paesi";

const TIPI: { campo: "rifugiato" | "sussidiaria" | "umanitaria" | "rifiuti"; testo: string }[] = [
  { campo: "rifugiato", testo: "Rifu\u00ADgiato" },
  { campo: "sussidiaria", testo: "Sussi\u00ADdiaria" },
  { campo: "umanitaria", testo: "Umani\u00ADtaria" },
  { campo: "rifiuti", testo: "Rifiu\u00ADtate" },
];

export default function TabellaPaesi({ paesi, anni, sicuro }: { paesi: Paese[]; anni: string[]; sicuro: Record<string, Record<string, string>> }) {
  const [anno, setAnno] = useState(anni[anni.length - 1]);
  const righe = [...paesi].sort((a, b) => b.anni[anno].richiedenti - a.anni[anno].richiedenti || a.nome.localeCompare(b.nome, "it"));
  return (
    <>
      <div className="periodi" role="group" aria-label="Anno">
        {anni.map((a) => (
          <button key={a} type="button" className={"periodo" + (anno === a ? " attivo" : "")} onClick={() => setAnno(a)}>{a}</button>
        ))}
      </div>
      <table className="tabella tabella-paese">
        <caption className="sr-only">I {paesi.length} paesi con richiedenti asilo, decisioni di prima istanza e quota di ciascun tipo di decisione sul totale delle decisioni e appartenenza all'elenco italiano dei paesi di origine sicuri, nel {anno}</caption>
        <thead>
          <tr>
            <th>Paese</th><th className="num">Richie&shy;denti</th><th className="num">Deci&shy;sioni</th>
            {TIPI.map((t) => <th key={t.campo} className="num">{t.testo}<small>quota</small></th>)}
            <th className="num">Paese sicuro</th>
          </tr>
        </thead>
        <tbody>
          {righe.map((p) => {
            const x = p.anni[anno], d = x.decisioni;
            return (
              <tr key={p.slug}>
                <td><Link href={`/paesi/${p.slug}`} prefetch={false} className="nome-prov">{p.nome}</Link></td>
                <td className="num">{nItal(x.richiedenti)}</td>
                <td className="num">{nItal(d.totale)}</td>
                {TIPI.map((t) => <td key={t.campo} className="num">{d.totale === 0 ? "n.d." : pct((d[t.campo] / d.totale) * 100)}</td>)}
                <td className="num">{sicuro[p.slug][anno]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
