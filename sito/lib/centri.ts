import dati from "@/data/centri.json";

export type BloccoCas = { centri: number; capienza: number | null; presenze: number | null; costo_mediano: number | null; costo_centri: number };
export type BloccoSai = { progetti: number; capienza: number | null; presenze: number | null; senza_presenze: number };
export type CentriAnno = { cas?: BloccoCas; sai?: BloccoSai };

export type CostoTipo = {
  centri: number; centri_con_costo: number; valori: number; mediana: number | null;
  q1: number | null; q3: number | null; presenze: number | null;
};
export type Tipo = "cas_adulti" | "cas_minori" | "cpa" | "hotspot";

export const centri = dati as unknown as {
  fonte: string; url: string; licenza: string; anni: string[];
  rilevazioni_cas: Record<string, string>;
  rilevazioni_sai: Record<string, string>;
  sai_ultimo_anno: { anno: string; presenze_progetti: number; presenze_strutture: number };
  nazionale: {
    costo_per_tipo: Record<string, Partial<Record<Tipo, CostoTipo>>>;
    presenze: Record<string, { cas: number; prima_accoglienza: number; sai: number }>;
  };
  province: Record<string, Record<string, CentriAnno>>;
};
