import { province, slug as mkSlug, trovaProvincia, caricaDettaglioProvincia, nProvincia } from "@/lib/dati";
import { piuRecenti, rispostaRss, rss } from "@/lib/feed";
import { dominio } from "@/lib/jsonld";

export const dynamic = "force-static";
const QUANTI = 50;

export function generateStaticParams() {
  return province.map((p) => ({ slug: mkSlug(p.provincia) }));
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = trovaProvincia(slug);
  if (!p) return new Response("Non trovato", { status: 404 });
  const d = await caricaDettaglioProvincia(slug);
  const voci = piuRecenti(d.contratti, QUANTI).map((c) => ({ ...c, provincia: p.provincia }));
  return rispostaRss(rss({
    titolo: `Affidamenti per l'accoglienza ${nProvincia(p.provincia)} · Osservatorio Accoglienza`,
    descrizione: `Gli ultimi ${voci.length} contratti per data, da dati ANAC.`,
    link: `${dominio}/provincia/${slug}`,
    self: `${dominio}/provincia/${slug}/feed.xml`,
    voci,
  }));
}
