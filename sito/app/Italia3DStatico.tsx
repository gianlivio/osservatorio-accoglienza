import { datiItalia } from "@/lib/italiaDati";
import { ALTEZZA, LARGHEZZA, alleggerisci, preparaScena, prismi, type Punto } from "@/lib/italia3d";

// Un poligono come tracciato con coordinate intere relative.
function tracciato(punti: Punto[]) {
  let d = "", px = 0, py = 0;
  punti.forEach(([u, v], i) => {
    const x = Math.round(u), y = Math.round(v);
    if (i === 0) d = `M${x} ${y}l`;
    else if (x !== px || y !== py) d += `${x - px} ${y - py} `;
    px = x; py = y;
  });
  return `${d.trimEnd()}z`.replace(/ -/g, "-");
}

/** La stessa vista del canvas, ferma, generata al build: si vede prima del caricamento e senza JavaScript. */
export default function Italia3DStatico() {
  const scena = alleggerisci(preparaScena(datiItalia.province), 1.5);
  const gia = new Set<number>();
  return (
    <svg viewBox={`0 0 ${LARGHEZZA} ${ALTEZZA}`} role="group" aria-label={datiItalia.descrizione}>
      {prismi(scena, 0, (i) => scena.altezze[i]).map((s, k) => {
        const p = datiItalia.province[s.provincia];
        const ripetuto = gia.has(s.provincia);
        gia.add(s.provincia);
        return (
          <a key={k} href={`/provincia/${p.slug}`} className={`m-c${p.classe}`} tabIndex={ripetuto ? -1 : undefined}
            aria-label={`${p.nome}: ${p.testoContratti}, ${p.testoQuota}`}>
            {s.lati.map((l, t) => l.length > 0 && <path key={t} className={`i3-l${t}`} d={l.map(tracciato).join("")} />)}
            <path className={s.piana ? "i3-cima i3-piana" : "i3-cima"} d={tracciato(s.cima)} />
          </a>
        );
      })}
    </svg>
  );
}
