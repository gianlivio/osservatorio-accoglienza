"use client";
import { useEffect } from "react";

const LARGO = "(min-width: 1360px)";

function segna(link: Map<string, HTMLAnchorElement | null>, attiva: string | undefined) {
  link.forEach((a, id) => {
    if (id === attiva) a?.setAttribute("aria-current", "location");
    else a?.removeAttribute("aria-current");
  });
}

/** Apre l'indice nella colonna laterale su schermi larghi e segna con aria-current la sezione in lettura. */
export default function IndiceAttivo({ ids }: { ids: string[] }) {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".indice");
    const det = nav?.querySelector("details");
    if (!nav || !det) return;
    const mq = window.matchMedia(LARGO);
    const allinea = () => { det.open = mq.matches; };
    allinea();
    mq.addEventListener("change", allinea);

    const link = new Map(ids.map((id) => [id, nav.querySelector<HTMLAnchorElement>(`a[href="#${id}"]`)]));
    const chiudi = (e: Event) => {
      if (!mq.matches && (e.target as HTMLElement).closest("a")) det.open = false;
    };
    det.addEventListener("click", chiudi);

    const sezioni = ids.map((id) => document.getElementById(id)).filter((s): s is HTMLElement => s !== null);
    const io = new IntersectionObserver((voci) => {
      for (const v of voci) {
        if (!v.isIntersecting) continue;
        segna(link, v.target.id);
      }
    }, { rootMargin: "-15% 0px -75% 0px" });
    sezioni.forEach((s) => io.observe(s));
    // In fondo alla pagina le ultime sezioni, se corte, non arrivano mai alla fascia osservata: segna l'ultima.
    const fondo = () => {
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 4) return;
      const ultima = sezioni[sezioni.length - 1]?.id;
      segna(link, ultima);
    };
    window.addEventListener("scroll", fondo, { passive: true });

    return () => {
      mq.removeEventListener("change", allinea);
      det.removeEventListener("click", chiudi);
      io.disconnect();
      window.removeEventListener("scroll", fondo);
    };
  }, [ids]);
  return null;
}
