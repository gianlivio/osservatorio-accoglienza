"use client";
import { useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Voce = { nome: string; percorso: string; chiave: string };
const MAX = 8;

const normalizza = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

function cerca(indice: Voce[], testo: string) {
  const parole = normalizza(testo).split(" ").filter(Boolean);
  if (testo.trim().length < 2 || parole.length === 0) return [];
  const trovate: { v: Voce; punti: number }[] = [];
  for (const v of indice) {
    if (!parole.every((p) => v.chiave.includes(p))) continue;
    const inizio = v.chiave.startsWith(parole[0]) ? 0 : v.chiave.includes(" " + parole[0]) ? 1 : 2;
    trovate.push({ v, punti: inizio });
  }
  return trovate.sort((a, b) => a.punti - b.punti).slice(0, MAX).map((t) => t.v);
}

export default function Ricerca() {
  const id = useId();
  const router = useRouter();
  const contenitore = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState<Voce[] | null>(null);
  const [errore, setErrore] = useState(false);
  const [testo, setTesto] = useState("");
  const [aperto, setAperto] = useState(false);
  const [attivo, setAttivo] = useState(-1);
  const caricamento = useRef(false);

  function carica() {
    if (caricamento.current) return;
    caricamento.current = true;
    fetch("/ricerca.json")
      .then((r) => r.json() as Promise<[string, string, string?][]>)
      .then((voci) => setIndice(voci.map(([nome, percorso, luoghi]) => ({ nome, percorso, chiave: normalizza(`${nome} ${luoghi ?? ""}`) }))))
      .catch(() => { caricamento.current = false; setErrore(true); });
  }

  const risultati = indice ? cerca(indice, testo) : [];
  const visibile = aperto && testo.trim().length >= 2;
  const idOpzione = (i: number) => `${id}-${i}`;

  function vai(i: number) {
    const r = risultati[i];
    if (!r) return;
    setAperto(false);
    router.push(r.percorso);
  }

  function tasto(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && risultati.length) {
      e.preventDefault(); setAperto(true); setAttivo((attivo + 1) % risultati.length);
    } else if (e.key === "ArrowUp" && risultati.length) {
      e.preventDefault(); setAperto(true); setAttivo((attivo <= 0 ? risultati.length : attivo) - 1);
    } else if (e.key === "Enter" && visibile && risultati.length) {
      e.preventDefault(); vai(attivo >= 0 ? attivo : 0);
    } else if (e.key === "Escape") {
      setAperto(false); setAttivo(-1);
    }
  }

  let stato = "";
  if (visibile) {
    if (errore) stato = "Ricerca non disponibile";
    else if (!indice) stato = "Caricamento";
    else stato = risultati.length ? `${risultati.length} risultati` : "Nessun risultato";
  }

  return (
    <div className="ricerca" ref={contenitore}
      onBlur={(e) => { if (!contenitore.current?.contains(e.relatedTarget)) { setAperto(false); setAttivo(-1); } }}>
      <label htmlFor={`${id}-campo`} className="ricerca-etichetta">Cerca una provincia o un ente gestore</label>
      <input id={`${id}-campo`} type="search" autoComplete="off" spellCheck={false}
        className="ricerca-campo" value={testo} placeholder="Nome di provincia o di ente"
        role="combobox" aria-expanded={visibile && risultati.length > 0} aria-controls={`${id}-lista`}
        aria-autocomplete="list" aria-activedescendant={visibile && attivo >= 0 ? idOpzione(attivo) : undefined}
        onFocus={() => { carica(); setAperto(true); }}
        onChange={(e) => { carica(); setTesto(e.target.value); setAperto(true); setAttivo(-1); }}
        onKeyDown={tasto} />
      <p className="sr-only" role="status" aria-live="polite">{stato}</p>
      <ul id={`${id}-lista`} role="listbox" aria-label="Risultati della ricerca" className="ricerca-lista" onMouseDown={(e) => e.preventDefault()} hidden={!(visibile && risultati.length > 0)}>
        {risultati.map((r, i) => (
          <li key={r.percorso} id={idOpzione(i)} role="option" aria-selected={i === attivo}
            className={i === attivo ? "attiva" : undefined}>
            <Link href={r.percorso} prefetch={false} tabIndex={-1}
              onClick={() => setAperto(false)}>
              <span>{r.nome}</span>
              <small>{r.percorso.startsWith("/provincia/") ? "provincia" : "ente gestore"}</small>
            </Link>
          </li>
        ))}
      </ul>
      {visibile && stato && risultati.length === 0 && <p className="nota-tabella ricerca-esito">{stato}</p>}
    </div>
  );
}
