// app/services/agruparContenidos.ts
// Agrupa el contenido de un pedido por envase físico, para que en las
// pantallas de pedido (cliente y vendedor) los gustos que van juntos en el
// mismo envase se muestren juntos, en vez de como una lista plana.

export type EnvaseLike = { id?: string | number | null; tipoEnvase?: string | null; nombre?: string | null } | null | undefined;
export type SaborLike = { id?: string | number | null; tipoSabor?: string | null; nombre?: string | null } | null | undefined;

export type ContenidoLike = {
  id?: number | string;
  grupo?: number | null;
  envase?: EnvaseLike;
  sabor?: SaborLike;
};

export type GrupoContenido = {
  key: string;
  grupo: number;
  envase: EnvaseLike;
  sabores: SaborLike[];
};

/**
 * Agrupa por (grupo, envaseId). El fallback por envaseId cubre pedidos viejos
 * que no tenían 'grupo' (todos quedaron en 0): evita mezclar envases
 * distintos en una misma tarjeta aunque coincidan en grupo.
 */
export function agruparContenidos(contenidos: ContenidoLike[]): GrupoContenido[] {
  const grupos = new Map<string, GrupoContenido>();

  contenidos.forEach((c) => {
    const grupo = typeof c.grupo === "number" ? c.grupo : 0;
    const envaseId = c.envase?.id ?? "sin-envase";
    const key = `${grupo}::${envaseId}`;

    if (!grupos.has(key)) {
      grupos.set(key, { key, grupo, envase: c.envase, sabores: [] });
    }
    grupos.get(key)!.sabores.push(c.sabor);
  });

  return Array.from(grupos.values()).sort((a, b) => a.grupo - b.grupo);
}

/** Paleta cíclica para diferenciar visualmente cada envase del pedido. */
export const COLORES_GRUPO = [
  { bg: "#fdeef4", border: "#f4679f", texto: "#c23f74" }, // rosa
  { bg: "#eafaf7", border: "#3fbfad", texto: "#2b8577" }, // menta
  { bg: "#fff6e6", border: "#f0a93c", texto: "#a86e12" }, // mostaza
  { bg: "#eef1ff", border: "#7b83f0", texto: "#4a52c9" }, // lavanda
  { bg: "#fdeeee", border: "#e06666", texto: "#b13c3c" }, // rojo suave
];

export function colorDeGrupo(indice: number) {
  return COLORES_GRUPO[indice % COLORES_GRUPO.length];
}
