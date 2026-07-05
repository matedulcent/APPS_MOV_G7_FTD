// app/services/apiError.ts

/**
 * Extrae un mensaje de error legible de una Response no-ok.
 * El back a veces responde JSON ({ error: "..." } o { ok:false, error:"..." })
 * y a veces texto plano (rutas legacy con res.send("...")); esto contempla
 * ambos casos en vez de mostrarle al usuario el body crudo.
 */
export async function parseApiError(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => "");
  if (!text) return fallback;
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.error === "string" && parsed.error.trim()) return parsed.error;
  } catch {
    // no era JSON: texto plano tal cual
  }
  return text || fallback;
}
