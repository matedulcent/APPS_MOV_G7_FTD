import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BASE_URL } from "./../../services/apiConfig";

// ==== Tipos ====
type Envase = { id: string; tipoEnvase: string; maxCantSabores: number };
type Sabor = { id: string; tipoSabor: string };
type Grupo = "Conos" | "Kilo" | "Vasos" | "Especiales";

// ==== API ====
async function getCatalogoEnvases(): Promise<Envase[]> {
  const r = await fetch(`${BASE_URL}/api/envases`);
  if (!r.ok) throw new Error("No se pudo leer /api/envases");
  return r.json();
}
async function getOferta(sucursalId: string): Promise<{ envases: Envase[]; sabores: Sabor[] }> {
  const r = await fetch(`${BASE_URL}/api/sucursales/${sucursalId}/oferta`);
  if (!r.ok) throw new Error("No se pudo leer oferta de sucursal");
  return r.json();
}
async function putOferta(
  sucursalId: string,
  envaseIds: string[],
  saborIds: string[]
): Promise<{ envases: Envase[]; sabores: Sabor[] }> {
  const payload = { envaseIds, saborIds };
  const r = await fetch(`${BASE_URL}/api/sucursales/${sucursalId}/oferta`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Error actualizando oferta");
  return data;
}
async function postEnvase(payload: { tipoEnvase: string; maxCantSabores: number }) {
  const r = await fetch(`${BASE_URL}/api/envases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "No se pudo crear el envase");
  return data as Envase;
}

// ==== Helpers ====
function grupoDe(tipoEnvase: string): Grupo {
  const k = (tipoEnvase.split("_")[0] || "").toLowerCase();
  if (k === "cucurucho") return "Conos";
  if (k === "kilo") return "Kilo";
  if (k === "vaso") return "Vasos";
  return "Especiales";
}
function labelFor(tipoEnvase: string) {
  const [kindRaw, restRaw] = tipoEnvase.split("_");
  const kind = (kindRaw ?? "").toLowerCase();
  const rest = restRaw ?? "";
  if (kind === "kilo") {
    if (rest === "1") return "1 kg";
    if (rest === "0.5") return "1/2 kg";
    if (rest === "0.25") return "1/4 kg";
    return `${rest} kg`;
  }
  if (kind === "cucurucho") return `Cono ${rest}`;
  if (kind === "vaso") return `Vaso ${rest}`;
  return tipoEnvase.replace("_", " ");
}

// ==== Componente principal ====
export default function Vendedor_Envases() {
  const { sucursalId: qp } = useLocalSearchParams<{ sucursalId?: string }>();
  const router = useRouter();
  const sucursalId = String(qp || "S1234");

  const [loading, setLoading] = useState(true);
  const [catalogoEnvases, setCatalogoEnvases] = useState<Envase[]>([]);
  const [seleccionEnvases, setSeleccionEnvases] = useState<Set<string>>(new Set());
  const [seleccionSabores, setSeleccionSabores] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [abierto, setAbierto] = useState<Record<Grupo, boolean>>({
    Conos: false,
    Kilo: false,
    Vasos: false,
    Especiales: false,
  });
  const [nuevoPorGrupo, setNuevoPorGrupo] = useState<Record<
    Grupo,
    { rest: string; max: string }
  >>({
    Conos: { rest: "", max: "" },
    Kilo: { rest: "", max: "" },
    Vasos: { rest: "", max: "" },
    Especiales: { rest: "", max: "" },
  });

  const onChangeNuevo = (g: Grupo, field: "rest" | "max", v: string) =>
    setNuevoPorGrupo((prev) => ({ ...prev, [g]: { ...prev[g], [field]: v } }));

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [envases, oferta] = await Promise.all([getCatalogoEnvases(), getOferta(sucursalId)]);
      setCatalogoEnvases(envases);
      setSeleccionEnvases(new Set((oferta.envases ?? []).map((e) => e.id)));
      setSeleccionSabores(new Set((oferta.sabores ?? []).map((s) => s.id)));
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo cargar la oferta");
    } finally {
      setLoading(false);
    }
  }, [sucursalId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const toggleEnvase = async (id: string) => {
    if (saving) return;
    const next = new Set(seleccionEnvases);
    next.has(id) ? next.delete(id) : next.add(id);
    setSeleccionEnvases(next);
    setSaving(true);
    try {
      const data = await putOferta(sucursalId, [...next], [...seleccionSabores]);
      setSeleccionEnvases(new Set((data.envases ?? []).map((e) => e.id)));
      setSeleccionSabores(new Set((data.sabores ?? []).map((s) => s.id)));
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo actualizar la oferta");
    } finally {
      setSaving(false);
    }
  };

  const crearEnvaseEnGrupo = async (g: Grupo) => {
    const { rest, max } = nuevoPorGrupo[g];
    const maxNum = Number(max);
    if (!rest.trim() || !Number.isFinite(maxNum) || maxNum <= 0) {
      Alert.alert("Error", "Datos inválidos.");
      return;
    }
    const kind =
      g === "Conos" ? "cucurucho" : g === "Vasos" ? "vaso" : g === "Kilo" ? "kilo" : "especial";
    const restNorm = g === "Kilo" ? rest.replace(",", ".") : rest;
    const tipoEnvase = `${kind}_${restNorm}`;

    try {
      await postEnvase({ tipoEnvase, maxCantSabores: maxNum });
      await cargar();
      setNuevoPorGrupo((prev) => ({ ...prev, [g]: { rest: "", max: "" } }));
      Alert.alert("Listo", `Se agregó "${labelFor(tipoEnvase)}".`);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo crear el envase");
    }
  };

  const irAPedidos = () => router.push({ pathname: "/screens/proveedor/Pedidos_Sucursal", params: { sucursalId } });

  const grupos = useMemo(() => {
    const map: Record<Grupo, Envase[]> = { Conos: [], Kilo: [], Vasos: [], Especiales: [] };
    for (const e of catalogoEnvases) map[grupoDe(e.tipoEnvase)].push(e);
    (Object.keys(map) as Grupo[]).forEach((g) =>
      map[g].sort((a, b) => labelFor(a.tipoEnvase).localeCompare(labelFor(b.tipoEnvase)))
    );
    return map;
  }, [catalogoEnvases]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4679f" />
        <Text style={styles.loadingText}>Cargando envases...</Text>
      </View>
    );
  }

  const orden: Grupo[] = ["Conos", "Kilo", "Vasos", "Especiales"];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Envases ofrecidos</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {orden.map((g) => (
          <View key={g} style={styles.group}>
            <TouchableOpacity
              onPress={() => setAbierto((prev) => ({ ...prev, [g]: !prev[g] }))}
              style={styles.groupHeader}
            >
              <Text style={styles.groupTitle}>{g}</Text>
              <Text>{abierto[g] ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {abierto[g] &&
              grupos[g].map((item) => {
                const checked = seleccionEnvases.has(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleEnvase(item.id)}
                    style={[styles.itemCard, checked && styles.itemCardSelected]}
                  >
                    <Text style={styles.itemTitle}>{labelFor(item.tipoEnvase)}</Text>
                    <Text style={styles.itemSubtitle}>Máx. sabores: {item.maxCantSabores}</Text>
                  </Pressable>
                );
              })}

            {abierto[g] && (
              <View style={styles.newContainer}>
                <View style={styles.newRow}>
                  <TextInput
                    placeholder="Tipo"
                    value={nuevoPorGrupo[g].rest}
                    onChangeText={(v) => onChangeNuevo(g, "rest", v)}
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Máx. sabores"
                    value={nuevoPorGrupo[g].max}
                    onChangeText={(v) => onChangeNuevo(g, "max", v)}
                    style={[styles.input, styles.inputSmall]}
                  />
                  <Pressable style={styles.addButton} onPress={() => crearEnvaseEnGrupo(g)}>
                    <Text style={styles.addButtonText}>+ Agregar</Text>
                  </Pressable>
                </View>
                <Text style={styles.hintText}>
                  El nuevo envase se guarda en el catálogo global.
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={irAPedidos} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Volver a Pedidos</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ==== Stylesheet ====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  scrollContent: { padding: 16, paddingBottom: 120 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: "#555" },

  group: { marginBottom: 12 },
  groupHeader: {
    padding: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  groupTitle: { fontWeight: "800", fontSize: 16 },

  itemCard: {
    padding: 12,
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  itemCardSelected: {
    borderColor: "#6200ee",
    backgroundColor: "#e0d7ff",
  },
  itemTitle: { fontWeight: "700", fontSize: 15 },
  itemSubtitle: { fontSize: 13, color: "#555", marginTop: 2 },

  newContainer: { marginTop: 8 },
  newRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  inputSmall: { width: 120 },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#1e90ff",
  },
  addButtonText: { color: "#fff", fontWeight: "700" },
  hintText: { marginTop: 6, fontSize: 12, color: "#666" },

  footer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  primaryButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#222",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
});
