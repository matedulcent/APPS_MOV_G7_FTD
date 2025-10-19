import { Platform } from "react-native";

const IS_ANDROID = Platform.OS === "android";
const BASE = IS_ANDROID ? "http://10.0.2.2:3000" : "http://localhost:3000"; // o IP de tu PC si es dispositivo físico
const API = `${BASE}/api`;

export type PedidoItem = { envaseId: string; saborId: string };

export async function crearOrden(payload: {
  usuarioId: string;
  sucursalId: string;
  items: PedidoItem[];
}) {
  const r = await fetch(`${API}/ordenes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(`Error ${r.status}: ${msg}`);
  }
  return r.json() as Promise<{ ok: boolean; ordenId: string }>;
}

/** MAPEOS a IDs de tu seed */
export function mapEnvaseKeyToId(key: string): string {
  // key ejemplo: "Cucuruchos 1 (2 bolas)"  | "Kilos 1 (1/4 Kg)" | "Vasos 1 (3 bolas)"
  const [categoria] = key.split(" ");
  if (categoria === "Cucuruchos") {
    const bolas = parseInt(key.match(/\((\d)\s+bolas?\)/)?.[1] ?? "1", 10);
    return { 1: "B1", 2: "B2", 3: "B3", 4: "B4" }[bolas] ?? "B1";
  }
  if (categoria === "Vasos") {
    const bolas = parseInt(key.match(/\((\d)\s+bolas?\)/)?.[1] ?? "1", 10);
    return { 1: "B8", 2: "B9", 3: "B10", 4: "B11" }[bolas] ?? "B8";
  }
  if (categoria === "Kilos") {
    const opt = key.match(/\(([^)]+)\)/)?.[1]?.trim();
    if (opt === "1/4 Kg") return "B6";
    if (opt === "1/2 Kg") return "B5";
    if (opt === "1 Kg")   return "B7";
  }
  // fallback
  return "B1";
}

export function mapSaborNameToId(name: string): string | null {
  // normalizo y mapeo variantes a tu seed:
  const n = name.trim().toLowerCase();
  const alias: Record<string, string> = {
  "frutilla": "F1",

  "chocolate": "F2",
  "choco blanco": "F3",
  "chocolate amargo": "F4",
  "chocolate con almendras": "F5",
  "choco menta": "F6",

  "ron": "F7",
  "ron con pasas": "F8",

  "vainilla": "F9",

  "cacahuate": "F10",
  "maní": "F11",

  "pistacho": "F12",

  "crema cielo": "F13",

  "crema": "F14",
  "yogur": "F15",

  "ddl": "F16",
  "dulce de leche": "F17",
  "caramelo": "F18",

  "americana": "F19",
  "crema americana": "F20",
};

  return alias[n] ?? null;
}
