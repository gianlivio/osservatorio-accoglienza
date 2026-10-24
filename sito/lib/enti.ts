import indice from "@/data/enti.json";

export type EnteIndice = { nome: string; slug: string; cf: string; affidamenti: number };
export type ContrattoEnte = {
  cig: string; data: string; oggetto: string; amministrazione: string; procedura: string;
  diretto: boolean; modalita: string; base: number | null; aggiudicato: number | null;
  provincia: string | null;
};
export type EnteDettaglio = {
  nome: string; cf: string; affidamenti: number; diretti: number; quota_diretti: number;
  per_anno: Record<string, { affidamenti: number; diretti: number; quota_diretti: number }>;
  province: { provincia: string; affidamenti: number }[];
  contratti: ContrattoEnte[];
};

export const enti = indice as EnteIndice[];
export const trovaEnte = (s: string) => enti.find((e) => e.slug === s);
export const slugEnteDaCf = new Map(enti.map((e) => [e.cf, e.slug]));
export async function caricaEnte(slug: string): Promise<EnteDettaglio> {
  const mod = await import(`@/data/ente/${slug}.json`);
  return mod.default as unknown as EnteDettaglio;
}
