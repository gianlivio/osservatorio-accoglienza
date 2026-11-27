"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ALTEZZA, GRADI_MASSIMI, GRADI_ROTAZIONE, LARGHEZZA, preparaScena, prismi, type DatiItalia, type Punto } from "@/lib/italia3d";

const SALITA = 1500, SALITA_PROVINCIA = 700; // millisecondi: l'onda va da nord a sud
const PERIODO = 24000;                       // una oscillazione completa
const PASSO = 1000 / 30;                     // fotogrammi della rotazione
const CHIARI = [20, 38, 56, 77, 100];        // quota di colore delle classi, come .m-c0…4
const LUCI = [72, 62];                       // lati: quota del colore della classe sul colore scuro

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mescola = (a: number[], b: number[], quota: number) => a.map((v, i) => Math.round((v * quota + b[i] * (100 - quota)) / 100));

export default function Italia3DTela({ dati }: { dati: DatiItalia }) {
  const router = useRouter();
  const cv = useRef<HTMLCanvasElement>(null);
  const tip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = cv.current!, riquadro = tip.current!;
    const ctx = canvas.getContext("2d")!;
    const scena = preparaScena(dati.province);
    const stile = getComputedStyle(document.documentElement);
    const [timbro, carta, inchiostro] = ["--timbro", "--carta", "--inchiostro"].map((v) => rgb(stile.getPropertyValue(v).trim()));
    const colori = CHIARI.map((q) => {
      const c = mescola(timbro, carta, q);
      return { cima: `rgb(${c})`, lati: LUCI.map((l) => `rgb(${mescola(c, inchiostro, l)})`) };
    });
    const nord = Math.min(...scena.anelli.map((a) => a.centro[1])), sud = Math.max(...scena.anelli.map((a) => a.centro[1]));
    // ritardo della salita: uno per provincia, dalla posizione del suo primo anello
    const ritardi = new Map<number, number>();
    for (const a of scena.anelli) if (!ritardi.has(a.provincia)) ritardi.set(a.provincia, ((a.centro[1] - nord) / (sud - nord)) * (SALITA - SALITA_PROVINCIA));

    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    let ridotto = mq.matches;
    let salita = ridotto ? SALITA : 0, fase = 0, gradi = 0;
    let sopra = false, toccata = false, visibile = false;
    let scelta: number | null = null;
    let disegnati: { provincia: number; forme: Path2D[] }[] = [];
    let quadro = 0, prima = 0;

    const poligono = (percorso: Path2D, p: Punto[]) => {
      percorso.moveTo(p[0][0], p[0][1]);
      for (let i = 1; i < p.length; i++) percorso.lineTo(p[i][0], p[i][1]);
      percorso.closePath();
    };

    function disegna() {
      const k = canvas.width / LARGHEZZA;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.clearRect(0, 0, LARGHEZZA, ALTEZZA);
      ctx.lineJoin = "round";
      const altezza = (i: number) => {
        const q = Math.min(1, Math.max(0, (salita - ritardi.get(i)!) / SALITA_PROVINCIA));
        return scena.altezze[i] * (1 - (1 - q) ** 3);
      };
      disegnati = prismi(scena, gradi, altezza).map((s) => {
        const c = colori[dati.province[s.provincia].classe];
        const forme: Path2D[] = [];
        s.lati.forEach((strisce, t) => {
          if (!strisce.length) return;
          const f = new Path2D();
          strisce.forEach((p) => poligono(f, p));
          ctx.fillStyle = c.lati[t]; ctx.fill(f);
          forme.push(f);
        });
        const cima = new Path2D();
        poligono(cima, s.cima);
        ctx.fillStyle = c.cima; ctx.fill(cima);
        const attiva = s.provincia === scelta;
        ctx.strokeStyle = `rgb(${attiva ? inchiostro : carta})`;
        ctx.lineWidth = attiva ? 3 : 1;
        if (attiva || !s.piana) ctx.stroke(cima); // il bordo chiaro cancellerebbe le isole più piccole
        forme.push(cima);
        return { provincia: s.provincia, forme };
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
          const meta = GRADI_ROTAZIONE * Math.sin((2 * Math.PI * fase) / PERIODO);
          // dopo un trascinamento la figura torna gradualmente nell'oscillazione
          const scarto = meta - gradi;
          gradi += Math.abs(scarto) < 0.5 ? scarto : scarto * 0.06;
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
        if (disegnati[i].forme.some((f) => ctx.isPointInPath(f, x, y))) return disegnati[i].provincia;
      return null;
    };
    function mostra(i: number | null, e?: { clientX: number; clientY: number }) {
      const cambia = i !== scelta;
      scelta = i;
      riquadro.hidden = i === null;
      if (i !== null && e) {
        const p = dati.province[i], r = canvas.getBoundingClientRect();
        if (cambia) {
          riquadro.replaceChildren(...[p.nome, p.testoContratti, p.testoQuota].map((t, n) => {
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
    const apri = (i: number) => router.push(`/provincia/${dati.province[i].slug}`);

    let presa: { id: number; x: number; y: number; gradi: number; mossa: boolean } | null = null;
    const onEntra = (e: PointerEvent) => { if (e.pointerType === "mouse") sopra = true; };
    const onEsce = (e: PointerEvent) => { if (e.pointerType === "mouse" && !presa) { sopra = false; mostra(null); avvia(); } };
    const onGiu = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.pointerType !== "mouse") toccata = true;
      presa = { id: e.pointerId, x: e.clientX, y: e.clientY, gradi, mossa: false };
      if (e.pointerType === "mouse") canvas.setPointerCapture(e.pointerId);
    };
    const onMuove = (e: PointerEvent) => {
      const mouse = e.pointerType === "mouse";
      if (presa && presa.id === e.pointerId && Math.hypot(e.clientX - presa.x, e.clientY - presa.y) > 6) presa.mossa = true;
      if (!mouse) return; // sul telefono solo tocco: lo scorrimento resta quello della pagina
      if (presa?.mossa) {
        gradi = Math.max(-GRADI_MASSIMI, Math.min(GRADI_MASSIMI, presa.gradi + (e.clientX - presa.x) * 0.2));
        canvas.style.cursor = "grabbing";
        mostra(null); disegna();
      } else {
        const i = trova(e);
        canvas.style.cursor = i === null ? "grab" : "pointer";
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
      if (i !== null && (mouse || i === scelta)) apri(i);
      else mostra(i, e);
    };
    const onAnnulla = () => { presa = null; };
    const onFuori = (e: PointerEvent) => { if (e.target !== canvas && toccata) { toccata = false; mostra(null); avvia(); } };

    const misura = () => {
      const lato = Math.round(canvas.clientWidth * Math.min(devicePixelRatio || 1, 2));
      if (!lato || lato === canvas.width) return;
      canvas.width = lato; canvas.height = Math.round((lato * ALTEZZA) / LARGHEZZA);
      disegna();
    };
    const ro = new ResizeObserver(misura);
    const io = new IntersectionObserver(([e]) => {
      visibile = e.isIntersecting;
      if (visibile) avvia(); else { toccata = false; sopra = false; mostra(null); }
    });
    const onMq = () => { ridotto = mq.matches; if (ridotto) { salita = SALITA; gradi = 0; disegna(); } else avvia(); };

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
      <canvas ref={cv} role="img" aria-label={`${dati.descrizione} I numeri di ogni provincia sono nella tabella più in basso.`} />
      <div ref={tip} className="italia3d-riquadro" hidden aria-live="polite" />
    </>
  );
}
