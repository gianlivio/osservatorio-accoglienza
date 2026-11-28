"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* Titoli, paragrafi e grafici sotto la prima schermata compaiono quando entrano nella vista,
 * una volta sola. Senza JavaScript, con prefers-reduced-motion o per ciò che è già visibile
 * al caricamento non cambia nulla. Le tabelle non sono toccate. */
const SELETTORE = [
  "main .titolo-sezione",
  "main .sezione > p",
  "main .prosa",
  "main .grafico",
  "main .grafico-barre",
  "main .grafico-naz",
  "main .dieci-grafico",
  "main .mesi",
  "main .continua",
].join(",");

export default function Comparsa() {
  const percorso = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const altezza = window.innerHeight;
    const io = new IntersectionObserver((voci) => {
      for (const v of voci) {
        if (!v.isIntersecting) continue;
        v.target.classList.add("visto");
        io.unobserve(v.target);
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll<HTMLElement>(SELETTORE).forEach((el) => {
      if (el.getBoundingClientRect().top < altezza) return;
      el.classList.add(el.classList.contains("titolo-sezione") ? "entra-lato" : "entra");
      io.observe(el);
    });
    return () => io.disconnect();
  }, [percorso]);
  return null;
}
