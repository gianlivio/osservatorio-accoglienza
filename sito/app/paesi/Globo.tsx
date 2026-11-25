"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { geoOrthographic, geoPath, geoRotation, geoContains, geoGraticule10 } from "d3-geo";
import { contorni, trovaContorno } from "@/lib/mondo";
import { COLORE, costruisciArco, larghezza, massimoRichiedenti, numero, proietta, trattiArco, type PaeseGlobo, type Punto } from "@/lib/globoGeom";
import LegendaGlobo, { DidascaliaGlobo } from "./LegendaGlobo";

const MAX_PX = 620;           // lato massimo del globo
const VELOCITA = 0.1;         // radianti al secondo, uguale per tutti i punti
const DISTANZA_PUNTI = 0.25;  // radianti tra un punto e il successivo sullo stesso arco
const DURATA_TRANSIZIONE = 500;
const PASSO_ANNI = 1500;
const MARE = "#F4F5F0", TERRA = "#DDE0D6", CONFINE = "#C3C7BC", INCHIOSTRO = "#1B1F1C";

type Tratti = Record<string, [number, number][][]>;

export default function Globo({ paesi, anni, italia }: { paesi: PaeseGlobo[]; anni: string[]; italia: Punto }) {
  const router = useRouter();
  const [idx, setIdx] = useState(anni.length - 1);
  const [gioca, setGioca] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const anno = anni[idx];
  const cv = useRef<HTMLCanvasElement>(null);
  const tela = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const motore = useRef<{ pedi: () => void; vai: (a: string, istantaneo?: boolean) => void; ricentra: () => void } | null>(null);
  const hoverRef = useRef<string | null>(null);
  const annoRef = useRef(anno);
  const idxRef = useRef(idx);

  useEffect(() => { hoverRef.current = hover; motore.current?.pedi(); }, [hover]);
  useEffect(() => { annoRef.current = anno; idxRef.current = idx; motore.current?.vai(anno); }, [anno, idx]);

  useEffect(() => {
    if (!gioca) return;
    const t = setInterval(() => {
      if (idxRef.current + 1 < anni.length) setIdx(idxRef.current + 1); else setGioca(false);
    }, PASSO_ANNI);
    return () => clearInterval(t);
  }, [gioca, anni.length]);

  useEffect(() => {
    const canvas = cv.current!, wrap = tela.current!, tooltip = tip.current!;
    const ctx = canvas.getContext("2d")!;
    const archi = paesi.map((p) => costruisciArco(p.slug, p.coordinate, italia));
    const max = massimoRichiedenti(paesi);
    const feat = new Map(paesi.map((p) => [p.slug, trovaContorno(p.contorno)!]));
    const reticolo = geoGraticule10();
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    let ridotto = mq.matches;
    const onMq = () => { ridotto = mq.matches; pedi(); };
    mq.addEventListener("change", onMq);

    let S = 0, dpr = 1;
    let rot: [number, number] = [-italia[0], -italia[1]];
    let cur: Record<string, number> = Object.fromEntries(paesi.map((p) => [p.slug, p.richiedenti[annoRef.current]]));
    let tr: { da: Record<string, number>; a: Record<string, number>; t0: number; dur: number } | null = null;
    let visibile = true, nascosto = document.hidden;
    let tratti: Tratti = {}, larg: Record<string, number> = {}, proj = geoOrthographic();
    let raf = 0;
    const t0 = performance.now();

    const continuo = () => !ridotto && visibile && !nascosto;
    function pedi() { if (!raf) raf = requestAnimationFrame(frame); }

    function vai(a: string, istantaneo?: boolean) {
      const dest = Object.fromEntries(paesi.map((p) => [p.slug, p.richiedenti[a]]));
      const dur = ridotto || istantaneo ? 0 : DURATA_TRANSIZIONE;
      if (dur === 0) { cur = dest; tr = null; } else tr = { da: { ...cur }, a: dest, t0: performance.now(), dur };
      pedi();
    }

    function misura() {
      S = Math.round(Math.min(wrap.clientWidth, MAX_PX));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = `${S}px`; canvas.style.height = `${S}px`;
      canvas.width = Math.round(S * dpr); canvas.height = Math.round(S * dpr);
      pedi();
    }

    function frame(ts: number) {
      raf = 0;
      if (tr) {
        const u = Math.min(1, (ts - tr.t0) / tr.dur), e = 1 - (1 - u) ** 3;
        for (const p of paesi) cur[p.slug] = tr.da[p.slug] + (tr.a[p.slug] - tr.da[p.slug]) * e;
        if (u >= 1) { cur = tr.a; tr = null; }
      }
      disegna(ts);
      if (tr || continuo()) pedi();
    }

    function disegna(ts: number) {
      if (!S) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, S, S);
      const R = S * 0.46, cx = S / 2, cy = S / 2;
      const rotazione = geoRotation([rot[0], rot[1]]);
      proj = geoOrthographic().translate([cx, cy]).scale(R).rotate([rot[0], rot[1]]).clipAngle(90).precision(0.6);
      const path = geoPath(proj, ctx);
      const attivo = hoverRef.current;

      ctx.beginPath(); path({ type: "Sphere" }); ctx.fillStyle = MARE; ctx.fill();
      ctx.beginPath(); path(reticolo); ctx.strokeStyle = CONFINE; ctx.globalAlpha = 0.45; ctx.lineWidth = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
      ctx.beginPath(); for (const f of contorni) path(f); ctx.fillStyle = TERRA; ctx.fill();
      ctx.strokeStyle = CONFINE; ctx.lineWidth = 0.6; ctx.stroke();
      for (const p of paesi) {
        ctx.beginPath(); path(feat.get(p.slug)!);
        ctx.fillStyle = COLORE[p.continente]; ctx.globalAlpha = attivo === p.slug ? 0.7 : 0.32; ctx.fill(); ctx.globalAlpha = 1;
      }
      ctx.beginPath(); path({ type: "Sphere" }); ctx.strokeStyle = INCHIOSTRO; ctx.lineWidth = 1; ctx.stroke();

      // archi: i più spessi sotto
      const maxPx = S * 0.03;
      larg = Object.fromEntries(paesi.map((p) => [p.slug, larghezza(cur[p.slug], max, maxPx)]));
      tratti = {};
      const ordine = [...archi].sort((a, b) => larg[b.slug] - larg[a.slug]);
      const colore = Object.fromEntries(paesi.map((p) => [p.slug, COLORE[p.continente]]));
      const sec = (ts - t0) / 1000;
      for (const a of ordine) {
        const w = larg[a.slug];
        if (w <= 0) continue;
        const t = trattiArco(a, rotazione, cx, cy, R);
        tratti[a.slug] = t;
        ctx.globalAlpha = attivo && attivo !== a.slug ? 0.3 : 0.88;
        ctx.strokeStyle = colore[a.slug]; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.lineJoin = "round";
        for (const seg of t) {
          if (seg.length < 2) continue;
          ctx.beginPath(); ctx.moveTo(seg[0][0], seg[0][1]); for (let i = 1; i < seg.length; i++) ctx.lineTo(seg[i][0], seg[i][1]); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        const o = proietta(rotazione, a.da, 0, cx, cy, R);
        if (o.visibile) {
          ctx.beginPath(); ctx.arc(o.x, o.y, Math.max(2.5, w / 2 + 1), 0, 2 * Math.PI);
          ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = colore[a.slug]; ctx.stroke();
        }
      }
      if (!ridotto) {
        // punti che scorrono lungo gli archi, alla stessa velocità angolare
        for (const a of ordine) {
          const w = larg[a.slug];
          if (w <= 0 || (attivo && attivo !== a.slug)) continue;
          const n = Math.max(1, Math.round(a.dist / DISTANZA_PUNTI));
          for (let k = 0; k < n; k++) {
            const u = (((sec * VELOCITA) / a.dist + k / n) % 1 + 1) % 1;
            const { p, h } = a.at(u);
            const q = proietta(rotazione, p, h, cx, cy, R);
            if (!q.visibile) continue;
            ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(1.8, w * 0.32 + 1), 0, 2 * Math.PI);
            ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = colore[a.slug]; ctx.stroke();
          }
        }
      }
      const it = proietta(rotazione, italia, 0, cx, cy, R);
      if (it.visibile) {
        ctx.beginPath(); ctx.arc(it.x, it.y, 5, 0, 2 * Math.PI); ctx.fillStyle = INCHIOSTRO; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
      }
    }

    // ---- interazione ----
    function colpisci(x: number, y: number, tocco: boolean): string | null {
      let migliore: string | null = null, dmin = Infinity;
      for (const [slug, segs] of Object.entries(tratti)) {
        const tol = Math.max(larg[slug] / 2, 2) + (tocco ? 12 : 6);
        for (const seg of segs) for (let i = 1; i < seg.length; i++) {
          const [x0, y0] = seg[i - 1], [x1, y1] = seg[i];
          const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy;
          const u = l2 ? Math.max(0, Math.min(1, ((x - x0) * dx + (y - y0) * dy) / l2)) : 0;
          const d = Math.hypot(x - (x0 + u * dx), y - (y0 + u * dy));
          if (d <= tol && d < dmin) { dmin = d; migliore = slug; }
        }
      }
      if (migliore) return migliore;
      const ll = proj.invert?.([x, y]);
      if (!ll || !isFinite(ll[0])) return null;
      for (const p of paesi) if (cur[p.slug] >= 0 && geoContains(feat.get(p.slug)!, ll)) return p.slug;
      return null;
    }

    function mostra(slug: string | null, x: number, y: number, tocco: boolean) {
      if (!slug) { tooltip.hidden = true; setHover(null); hoverRef.current = null; pedi(); return; }
      const p = paesi.find((q) => q.slug === slug)!;
      tooltip.hidden = false;
      tooltip.replaceChildren();
      const b = document.createElement("strong"); b.textContent = p.nome;
      const n = document.createElement("span");
      const v = p.richiedenti[annoRef.current];
      n.textContent = `${numero(v)} richiedenti asilo nel ${annoRef.current}`;
      tooltip.append(b, n);
      if (tocco) { const s = document.createElement("small"); s.textContent = "Tocca di nuovo per aprire la pagina"; tooltip.append(s); }
      const w = tooltip.offsetWidth, h = tooltip.offsetHeight;
      tooltip.style.left = `${Math.max(4, Math.min(S - w - 4, x - w / 2))}px`;
      tooltip.style.top = `${Math.max(4, y - h - 14)}px`;
      hoverRef.current = slug; setHover(slug); pedi();
    }

    let giu: { id: number; x: number; y: number; r0: [number, number]; mosso: boolean } | null = null;
    const pos = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
    const onDown = (e: PointerEvent) => {
      const [x, y] = pos(e);
      giu = { id: e.pointerId, x, y, r0: [...rot], mosso: false };
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      const [x, y] = pos(e);
      if (giu && giu.id === e.pointerId) {
        if (!giu.mosso && Math.hypot(x - giu.x, y - giu.y) > 5) { giu.mosso = true; canvas.style.cursor = "grabbing"; mostra(null, 0, 0, false); }
        if (giu.mosso) {
          const k = 180 / (Math.PI * S * 0.46);
          rot = [giu.r0[0] + (x - giu.x) * k, Math.max(-90, Math.min(90, giu.r0[1] - (y - giu.y) * k))];
          pedi();
        }
        return;
      }
      if (e.pointerType === "mouse") {
        const s = colpisci(x, y, false);
        canvas.style.cursor = s ? "pointer" : "grab";
        mostra(s, x, y, false);
      }
    };
    const onUp = (e: PointerEvent) => {
      const g = giu; giu = null;
      canvas.style.cursor = "grab";
      if (!g || g.id !== e.pointerId || g.mosso) return;
      const [x, y] = pos(e);
      const tocco = e.pointerType !== "mouse";
      const s = colpisci(x, y, tocco);
      if (!s) { mostra(null, 0, 0, false); return; }
      if (!tocco || hoverRef.current === s) router.push(`/paesi/${s}`);
      else mostra(s, x, y, true);
    };
    const onAnnulla = () => { giu = null; };
    const onEsce = (e: PointerEvent) => { if (e.pointerType === "mouse" && !giu) mostra(null, 0, 0, false); };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onAnnulla);
    canvas.addEventListener("pointerleave", onEsce);

    const ro = new ResizeObserver(misura); ro.observe(wrap);
    const io = new IntersectionObserver(([e]) => { visibile = e.isIntersecting; if (visibile) pedi(); }); io.observe(wrap);
    const onVis = () => { nascosto = document.hidden; if (!nascosto) pedi(); };
    document.addEventListener("visibilitychange", onVis);
    canvas.style.cursor = "grab";
    motore.current = {
      pedi, vai,
      ricentra: () => { rot = [-italia[0], -italia[1]]; pedi(); },
    };
    misura();
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); mq.removeEventListener("change", onMq);
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointerdown", onDown); canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp); canvas.removeEventListener("pointercancel", onAnnulla);
      canvas.removeEventListener("pointerleave", onEsce);
      motore.current = null;
    };
  }, [paesi, italia, router]);

  const cambia = useCallback((i: number) => { setGioca(false); setIdx(i); }, []);
  const avvia = () => { if (gioca) { setGioca(false); return; } if (idx === anni.length - 1) setIdx(0); setGioca(true); };

  return (
    <div className="globo" data-globo="vivo">
      <div className="globo-tela" ref={tela}>
        <canvas ref={cv} role="img" aria-label="Globo centrato sull'Italia, con un arco da ciascun paese di cittadinanza. I numeri sono nell'elenco dei paesi." />
        <div className="globo-tip" ref={tip} hidden />
      </div>
      <div className="globo-barra">
        <button type="button" className="globo-play" onClick={avvia} aria-label={gioca ? "Pausa" : "Riproduci gli anni"}>
          {gioca
            ? <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" /></svg>
            : <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor" /></svg>}
        </button>
        <input type="range" className="globo-anni" min={0} max={anni.length - 1} step={1} value={idx} aria-label="Anno"
          aria-valuetext={anno} onChange={(e) => cambia(+e.target.value)} />
        <output className="globo-anno" aria-live="polite">{anno}</output>
      </div>
      <div className="globo-assi">
        <span>{anni[0]}</span>
        <button type="button" className="globo-ricentra" onClick={() => motore.current?.ricentra()}>Ricentra sull&apos;Italia</button>
        <span>{anni[anni.length - 1]}</span>
      </div>
      <LegendaGlobo paesi={paesi} anno={anno} attivo={hover} onEntra={setHover} onEsce={() => setHover(null)} />
      <DidascaliaGlobo />
    </div>
  );
}
