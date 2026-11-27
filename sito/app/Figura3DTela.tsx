"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motore, type DatiFigura } from "@/lib/motori";
import { CHIARI, LUCI, type Punto } from "@/lib/scena3d";

const SALITA = 1500, SALITA_VOCE = 700; // millisecondi: le voci salgono a onda
const PERIODO = 24000;                  // una oscillazione completa
const PASSO = 1000 / 30;                // fotogrammi del movimento

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mescola = (a: number[], b: number[], quota: number) => a.map((v, i) => Math.round((v * quota + b[i] * (100 - quota)) / 100));

export default function Figura3DTela({ dati }: { dati: DatiFigura }) {
  const router = useRouter();
  const cv = useRef<HTMLCanvasElement>(null);
  const tip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = cv.current!, riquadro = tip.current!;
    const ctx = canvas.getContext("2d")!;
    const m = motore(dati);
    const stile = getComputedStyle(document.documentElement);
    const [timbro, carta, inchiostro, linea] = ["--timbro", "--carta", "--inchiostro", "--linea"].map((v) => rgb(stile.getPropertyValue(v).trim()));
    const dato = stile.getPropertyValue("--dato").trim();
    const colori = m.voci.map((v) => {
      const q = v.classe === undefined ? v.tono : CHIARI[v.classe];
      const c = q === null ? linea : mescola(timbro, carta, q);
      const [l0, l1] = LUCI.map((l) => `rgb(${mescola(c, inchiostro, l)})`);
      return { cima: `rgb(${c})`, piana: `rgb(${c})`, l0, l1, filo: "transparent", pannello: `rgba(${timbro},0.13)` };
    });

    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    let ridotto = mq.matches;
    let salita = ridotto ? SALITA : 0, fase = 0, posa = 0;
    let sopra = false, toccata = false, visibile = false;
    let scelta: number | null = null;
    let disegnati: { voce: number; forme: Path2D[] }[] = [];
    let quadro = 0, prima = 0;

    const poligono = (percorso: Path2D, p: Punto[]) => {
      percorso.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < p.length; i++) percorso.lineTo(p[i][0], p[i][1]);
      percorso.closePath();
    };

    function disegna() {
      const k = canvas.width / m.larghezza;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.clearRect(0, 0, m.larghezza, m.altezza);
      ctx.lineJoin = "round";
      const crescita = (i: number) => {
        const q = Math.min(1, Math.max(0, (salita - m.ritardi[i] * (SALITA - SALITA_VOCE)) / SALITA_VOCE));
        return 1 - (1 - q) ** 3;
      };
      disegnati = m.quadro(posa, crescita).map(({ voce, facce, testi }) => {
        const attiva = voce === scelta;
        const forme = facce.map(({ ruolo, punti }) => {
          const f = new Path2D();
          punti.forEach((p) => poligono(f, p));
          ctx.fillStyle = colori[voce][ruolo]; ctx.fill(f);
          // il bordo chiaro cancellerebbe le isole più piccole
          const bordo =
            ruolo === "cima" ? { colore: `rgb(${attiva ? inchiostro : carta})`, spessore: attiva ? 3 : 1 }
            : ruolo === "filo" ? { colore: `rgb(${attiva ? inchiostro : timbro})`, spessore: 2.5 }
            : ruolo === "pannello" ? { colore: `rgba(${attiva ? inchiostro : timbro},0.55)`, spessore: attiva ? 3 : 1.5 }
            : attiva && ruolo === "piana" ? { colore: `rgb(${inchiostro})`, spessore: 3 } : null;
          if (bordo) { ctx.strokeStyle = bordo.colore; ctx.lineWidth = bordo.spessore; ctx.stroke(f); }
          return f;
        });
        testi?.forEach((t) => {
          ctx.font = t.ruolo === "legge" ? `600 28px ${dato}` : `400 27px ${dato}`;
          ctx.fillStyle = `rgb(${t.ruolo === "legge" ? timbro : inchiostro})`;
          ctx.textAlign = "center";
          ctx.fillText(t.testo, t.x, t.y);
        });
        return { voce, forme };
      });
    }

    const inMoto = () => visibile && !ridotto && (salita < SALITA || (!sopra && !toccata));
    function anima(ora: number) {
      quadro = 0;
      if (!inMoto()) return;
      const dt = prima ? ora - prima : 0;
      if (!prima || salita < SALITA || dt >= PASSO - 2) {
        prima = ora;
        const passo = Math.min(dt, 100);
        if (salita < SALITA) salita += passo;
        else {
          fase += passo;
          const meta = m.ampiezza * Math.sin((2 * Math.PI * fase) / PERIODO);
          // dopo un trascinamento la figura torna gradualmente nell'oscillazione
          const scarto = meta - posa;
          posa += Math.abs(scarto) < m.ampiezza / 30 ? scarto : scarto * 0.06;
        }
        disegna();
      }
      quadro = requestAnimationFrame(anima);
    }
    const avvia = () => { if (!quadro && inMoto()) { prima = 0; quadro = requestAnimationFrame(anima); } };

    const trova = (e: { clientX: number; clientY: number }) => {
      const r = canvas.getBoundingClientRect(), k = canvas.width / r.width;
      const x = (e.clientX - r.left) * k, y = (e.clientY - r.top) * k;
      for (let i = disegnati.length - 1; i >= 0; i--)
        if (disegnati[i].forme.some((f) => ctx.isPointInPath(f, x, y))) return disegnati[i].voce;
      return null;
    };
    function mostra(i: number | null, e?: { clientX: number; clientY: number }) {
      const cambia = i !== scelta;
      scelta = i;
      riquadro.hidden = i === null;
      if (i !== null && e) {
        const r = canvas.getBoundingClientRect();
        if (cambia) {
          riquadro.replaceChildren(...m.voci[i].testi.map((t, n) => {
            const el = document.createElement(n ? "span" : "b"); el.textContent = t; return el;
          }));
        }
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const sinistra = x + 14 + riquadro.offsetWidth > r.width ? x - 14 - riquadro.offsetWidth : x + 14;
        riquadro.style.left = `${Math.max(0, sinistra)}px`;
        riquadro.style.top = `${Math.max(0, y - riquadro.offsetHeight - 10)}px`;
      }
      if (cambia) disegna();
    }
    const apri = (i: number) => {
      const href = m.voci[i].href;
      if (!href) return;
      if (href.startsWith("#")) location.assign(href); else router.push(href);
    };

    let presa: { id: number; x: number; y: number; posa: number; mossa: boolean } | null = null;
    const onEntra = (e: PointerEvent) => { if (e.pointerType === "mouse") sopra = true; };
    const onEsce = (e: PointerEvent) => { if (e.pointerType === "mouse" && !presa) { sopra = false; mostra(null); avvia(); } };
    const onGiu = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.pointerType !== "mouse") toccata = true;
      presa = { id: e.pointerId, x: e.clientX, y: e.clientY, posa, mossa: false };
      if (e.pointerType === "mouse") canvas.setPointerCapture(e.pointerId);
    };
    const onMuove = (e: PointerEvent) => {
      const mouse = e.pointerType === "mouse";
      if (presa && presa.id === e.pointerId && Math.hypot(e.clientX - presa.x, e.clientY - presa.y) > 6) presa.mossa = true;
      if (!mouse) return; // sul telefono solo tocco: lo scorrimento resta quello della pagina
      if (presa?.mossa) {
        posa = Math.max(-m.limite, Math.min(m.limite, presa.posa + (e.clientX - presa.x) * m.perPixel));
        canvas.style.cursor = "grabbing";
        mostra(null); disegna();
      } else {
        const i = trova(e);
        canvas.style.cursor = i !== null && m.voci[i].href ? "pointer" : "grab";
        mostra(i, e);
      }
    };
    const onSu = (e: PointerEvent) => {
      const g = presa;
      presa = null;
      if (!g || g.id !== e.pointerId) return;
      const mouse = e.pointerType === "mouse";
      if (g.mossa) {
        const r = canvas.getBoundingClientRect();
        if (mouse && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) { sopra = false; avvia(); }
        if (mouse) canvas.style.cursor = "grab";
        return;
      }
      const i = trova(e);
      if (i !== null && m.voci[i].href && (mouse || i === scelta)) apri(i);
      else mostra(i, e);
    };
    const onAnnulla = () => { presa = null; };
    const onFuori = (e: PointerEvent) => { if (e.target !== canvas && toccata) { toccata = false; mostra(null); avvia(); } };

    const misura = () => {
      const lato = Math.round(canvas.clientWidth * Math.min(devicePixelRatio || 1, 2));
      if (!lato || lato === canvas.width) return;
      canvas.width = lato; canvas.height = Math.round((lato * m.altezza) / m.larghezza);
      disegna();
    };
    const ro = new ResizeObserver(misura);
    const io = new IntersectionObserver(([e]) => {
      visibile = e.isIntersecting;
      if (visibile) avvia(); else { toccata = false; sopra = false; mostra(null); }
    });
    const onMq = () => { ridotto = mq.matches; if (ridotto) { salita = SALITA; posa = 0; disegna(); } else avvia(); };

    misura();
    ro.observe(canvas); io.observe(canvas); mq.addEventListener("change", onMq);
    canvas.addEventListener("pointerenter", onEntra);
    canvas.addEventListener("pointerleave", onEsce);
    canvas.addEventListener("pointerdown", onGiu);
    canvas.addEventListener("pointermove", onMuove);
    canvas.addEventListener("pointerup", onSu);
    canvas.addEventListener("pointercancel", onAnnulla);
    document.addEventListener("pointerdown", onFuori);
    return () => {
      cancelAnimationFrame(quadro); ro.disconnect(); io.disconnect(); mq.removeEventListener("change", onMq);
      canvas.removeEventListener("pointerenter", onEntra); canvas.removeEventListener("pointerleave", onEsce);
      canvas.removeEventListener("pointerdown", onGiu); canvas.removeEventListener("pointermove", onMuove);
      canvas.removeEventListener("pointerup", onSu); canvas.removeEventListener("pointercancel", onAnnulla);
      document.removeEventListener("pointerdown", onFuori);
    };
  }, [dati, router]);

  return (
    <>
      <canvas ref={cv} role="img" aria-label={dati.descrizione} />
      <div ref={tip} className="figura3d-riquadro" hidden aria-live="polite" />
    </>
  );
}
