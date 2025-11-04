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

type Envase = { id: string; tipoEnvase: string; maxCantSabores: number };
type Sabor = { id: string; tipoSabor: string };

async function getCatalogoSabores(): Promise<Sabor[]> {
  const r = await fetch(`${BASE_URL}/api/sabores`);
  if (!r.ok) throw new Error("No se pudo leer /api/sabores");
  return r.json();
}
async function getOferta(
  sucursalId: string
): Promise<{ envases: Envase[]; sabores: Sabor[] }> {
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

async function postSabor(payload: { tipoSabor: string }) {
  const r = await fetch(`${BASE_URL}/api/sabores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "No se pudo crear el sabor");
  return data as Sabor;
}

type Grupo =
  | "Cremas"
  | "Frutales"
  | "Dulce de leche"
  | "Chocolates"
  | "Especiales";

const ordenGrupos: Grupo[] = [
  "Cremas",
  "Frutales",
  "Dulce de leche",
  "Chocolates",
  "Especiales",
];

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function grupoDeSabor(nombre: string): Grupo {
  const n = normalize(nombre);
  if (/(chocolate|choco|cacao|amargo|blanco|almendra|almendras|menta)/.test(n)) return "Chocolates";
  if (/(dulce de leche|ddl)/.test(n)) return "Dulce de leche";
  if (/(crema|americana|vainilla|tramontana|sambayon|flan|yogur|yogurt|ricota|panna|nata)/.test(n)) return "Cremas";
  if (/(frutilla|fresa|limon|naranja|frambuesa|mora|maracuya|anan|piña|mango|durazno|melocoton|kiwi|uva|manzana|pera|cereza|sandia|melon|banana|platano)/.test(n)) return "Frutales";
  return "Especiales";
}

export default function Vendedor_Productos() {
  const { sucursalId: qp } = useLocalSearchParams<{ sucursalId?: string }>();
  const router = useRouter();
  const sucursalId = String(qp || "S1234");

  const [loading, setLoading] = useState(true);
  const [catalogoSabores, setCatalogoSabores] = useState<Sabor[]>([]);
  const [seleccionSabores, setSeleccionSabores] = useState<Set<string>>(new Set());
  const [seleccionEnvases, setSeleccionEnvases] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const [abierto, setAbierto] = useState<Record<Grupo, boolean>>({
    Cremas: false,
    Frutales: false,
    "Dulce de leche": false,
    Chocolates: false,
    Especiales: false,
  });

  const [nuevoSaborPorGrupo, setNuevoSaborPorGrupo] = useState<Record<Grupo, string>>({
    Cremas: "",
    Frutales: "",
    "Dulce de leche": "",
    Chocolates: "",
    Especiales: "",
  });

  const onChangeNuevoSabor = (g: Grupo, v: string) =>
    setNuevoSaborPorGrupo((prev) => ({ ...prev, [g]: v }));

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [sabores, oferta] = await Promise.all([
        getCatalogoSabores(),
        getOferta(sucursalId),
      ]);
      setCatalogoSabores(sabores);
      setSeleccionSabores(new Set((oferta.sabores ?? []).map((s) => s.id)));
      setSeleccionEnvases(new Set((oferta.envases ?? []).map((e) => e.id)));
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo cargar la oferta");
    } finally {
      setLoading(false);
    }
  }, [sucursalId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const toggleSabor = async (id: string) => {
    if (saving) return;
    const next = new Set(seleccionSabores);
    next.has(id) ? next.delete(id) : next.add(id);

    setSeleccionSabores(next);
    setSaving(true);
    try {
      const data = await putOferta(sucursalId, [...seleccionEnvases], [...next]);
      setSeleccionEnvases(new Set((data.envases ?? []).map((e) => e.id)));
      setSeleccionSabores(new Set((data.sabores ?? []).map((s) => s.id)));
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo actualizar la oferta");
    } finally {
      setSaving(false);
    }
  };

  const crearSaborEnGrupo = async (g: Grupo) => {
    const nombre = (nuevoSaborPorGrupo[g] || "").trim();
    if (!nombre) {
      Alert.alert("Nombre requerido", "Ingresá un nombre para el nuevo gusto.");
      return;
    }
    try {
      await postSabor({ tipoSabor: nombre });
      await cargar();
      setNuevoSaborPorGrupo((prev) => ({ ...prev, [g]: "" }));
      Alert.alert("Listo", `Se agregó "${nombre}".`);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo crear el sabor");
    }
  };

  const irAPedidos = () =>
    router.push({
      pathname: "/screens/proveedor/Pedidos_Sucursal",
      params: { sucursalId },
    });

  const grupos = useMemo(() => {
    const map: Record<Grupo, Sabor[]> = {
      Cremas: [],
      Frutales: [],
      "Dulce de leche": [],
      Chocolates: [],
      Especiales: [],
    };
    for (const s of catalogoSabores) {
      const g = grupoDeSabor(s.tipoSabor);
      map[g].push(s);
    }
    (Object.keys(map) as Grupo[]).forEach((g) =>
      map[g].sort((a, b) => a.tipoSabor.localeCompare(b.tipoSabor))
    );
    return map;
  }, [catalogoSabores]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f4679f" />
        <Text style={styles.loaderText}>Cargando gustos...</Text>
      </View>
    );
  }

  const gruposConContenido = ordenGrupos.filter((g) => (grupos[g] ?? []).length > 0 || true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gustos ofrecidos</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {gruposConContenido.map((g) => (
          <View key={g} style={styles.groupCard}>
            <TouchableOpacity
              onPress={() => setAbierto((prev) => ({ ...prev, [g]: !prev[g] }))}
              style={styles.groupHeader}
            >
              <Text style={styles.groupTitle}>{g}</Text>
              <Text style={styles.groupArrow}>{abierto[g] ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {abierto[g] &&
              (grupos[g] ?? []).map((item) => {
                const checked = seleccionSabores.has(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleSabor(item.id)}
                    style={[styles.saborCard, checked && styles.saborCardSelected]}
                  >
                    <Text style={styles.saborNombre}>{item.tipoSabor}</Text>
                    <Text style={styles.saborHint}>
                      Tocar para {checked ? "quitar" : "agregar"} este sabor a la oferta
                    </Text>
                  </Pressable>
                );
              })}

            {abierto[g] && (
              <View style={styles.newSaborContainer}>
                <View style={styles.newSaborRow}>
                  <TextInput
                    placeholder={`Nuevo gusto en ${g}`}
                    value={nuevoSaborPorGrupo[g]}
                    onChangeText={(v) => onChangeNuevoSabor(g, v)}
                    style={styles.newSaborInput}
                  />
                  <Pressable
                    onPress={() => crearSaborEnGrupo(g)}
                    style={styles.newSaborButton}
                  >
                    <Text style={styles.newSaborButtonText}>+ Agregar</Text>
                  </Pressable>
                </View>
                <Text style={styles.newSaborHint}>
                  El nuevo gusto se guarda en el catálogo global y luego podés activarlo
                  para esta sucursal.
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={irAPedidos} style={styles.footerButton}>
          <Text style={styles.footerButtonText}>Volver a Pedidos</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "rgba(255,255,255,0.6)" },
  header: { alignItems: "center", marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "900", textAlign: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 12 },
  groupCard: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  groupHeader: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groupTitle: { fontWeight: "800" },
  groupArrow: { opacity: 0.7 },
  saborCard: {
    padding: 12,
    margin: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  saborCardSelected: { borderColor: "#1e90ff", backgroundColor: "#eaf3ff" },
  saborNombre: { fontWeight: "700" },
  saborHint: { marginTop: 6, fontSize: 12, opacity: 0.6 },
  newSaborContainer: { paddingHorizontal: 8, paddingBottom: 12 },
  newSaborRow: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 8 },
  newSaborInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  newSaborButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#1e90ff",
  },
  newSaborButtonText: { color: "#fff", fontWeight: "700" },
  newSaborHint: { marginTop: 6, fontSize: 12, opacity: 0.6 },
  footer: { gap: 10, marginTop: 4 },
  footerButton: {
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#222",
  },
  footerButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  loaderContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  loaderText: { marginTop: 8 },
});
