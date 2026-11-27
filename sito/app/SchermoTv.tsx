"use client";
import { useEffect, useRef } from "react";

type Immagine = { file: string; alt: string };
const DURATA = 3000, DISSOLVENZA = 600; // millisecondi

/**
 * Le foto in successione, disegnate su canvas: si scaricano dopo il primo rendering, quando lo schermo è visibile,
 * e non diventano l'elemento principale della pagina. Ogni foto è intera (nessun ritaglio) su fondo scuro.
 */
export default function SchermoTv({ immagini }: { immagini: Immagine[] }) {
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = cv.current!, ctx = canvas.getContext("2d")!;
    const televisore = canvas.closest(".tv")!;
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const caricate: (Promise<HTMLImageElement> | undefined)[] = [];
    const carica = (i: number) => (caricate[i] ??= new Promise((si, no) => {
      const img = new Image();
      img.onload = () => si(img);
      img.onerror = () => { caricate[i] = undefined; no(); };
      img.src = immagini[i].file;
    }));
    let indice = 0, mostrata: HTMLImageElement | null = null;
    let visibile = false, sopra = false, fuoco = false, smontato = false, occupato = false;
    let attesa = 0, quadro = 0;

    function disegna(img: HTMLImageElement, opacita: number) {
      const k = Math.min(canvas.width / img.width, canvas.height / img.height), w = img.width * k, h = img.height * k;
      ctx.globalAlpha = opacita;
      ctx.fillStyle = "#101311";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    }
    function dissolvi(i: number, img: HTMLImageElement) {
      occupato = true;
      let inizio = 0;
      const passo = (ora: number) => {
        inizio ||= ora;
        const q = mq.matches ? 1 : Math.min(1, (ora - inizio) / DISSOLVENZA);
        // la foto nuova, con il suo fondo, si sovrappone alla precedente
        disegna(img, q);
        if (q < 1) quadro = requestAnimationFrame(passo);
        else { occupato = false; mostrata = img; indice = i; canvas.setAttribute("aria-label", immagini[i].alt); programma(); }
      };
      quadro = requestAnimationFrame(passo);
    }
    const inMoto = () => visibile && !sopra && !fuoco && !mq.matches && !document.hidden;
    function programma() {
      clearTimeout(attesa);
      if (occupato || !visibile) return;
      if (!mostrata) { carica(0).then((img) => { if (!smontato && !mostrata && !occupato) dissolvi(0, img); }).catch(() => {}); return; }
      if (!inMoto()) return;
      const prossima = (indice + 1) % immagini.length;
      const pronta = carica(prossima);
      attesa = window.setTimeout(() => {
        pronta.then((img) => { if (!smontato && !occupato && inMoto()) dissolvi(prossima, img); })
          .catch(() => { indice = prossima; programma(); });
      }, DURATA);
    }

    const io = new IntersectionObserver(([e]) => { visibile = e.isIntersecting; programma(); });
    const onEntra = (e: Event) => { if ((e as PointerEvent).pointerType === "mouse") { sopra = true; clearTimeout(attesa); } };
    const onEsce = () => { sopra = false; programma(); };
    const onFuoco = () => { fuoco = true; clearTimeout(attesa); };
    const onSfuoco = () => { fuoco = false; programma(); };
    const avvio = window.setTimeout(() => io.observe(canvas), 200);
    televisore.addEventListener("pointerenter", onEntra);
    televisore.addEventListener("pointerleave", onEsce);
    televisore.addEventListener("focusin", onFuoco);
    televisore.addEventListener("focusout", onSfuoco);
    document.addEventListener("visibilitychange", programma);
    mq.addEventListener("change", programma);
    return () => {
      smontato = true; clearTimeout(avvio); clearTimeout(attesa); cancelAnimationFrame(quadro); io.disconnect();
      televisore.removeEventListener("pointerenter", onEntra); televisore.removeEventListener("pointerleave", onEsce);
      televisore.removeEventListener("focusin", onFuoco); televisore.removeEventListener("focusout", onSfuoco);
      document.removeEventListener("visibilitychange", programma); mq.removeEventListener("change", programma);
    };
  }, [immagini]);

  return <canvas ref={cv} width={640} height={480} role="img" aria-label={immagini[0].alt} />;
}
