import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import topo from "world-atlas/countries-110m.json";

// Contorni del mondo: world-atlas countries-110m (Natural Earth, pubblico dominio). Senza altri dati: va anche nel client.
export type Contorno = Feature<Geometry, { name: string }>;
const t = topo as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
export const contorni = (feature(t, t.objects.countries) as unknown as { features: Contorno[] }).features;
export const trovaContorno = (id: string) => contorni.find((f) => (/^\d+$/.test(id) ? f.id === id : f.properties.name === id));
