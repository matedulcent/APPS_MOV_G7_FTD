import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BASE_URL } from "./../../services/apiConfig";

type Envase = { id: string; tipoEnvase: string; maxCantSabores: number; categoria: string };
type Sabor = { id: string; tipoSabor: string };
type Categoria = { id: string; nombre: string };

const CATEGORIA_FALLBACK = "Especiales";

async function getCatalogoEnvases(): Promise<Envase[]> {
  const r = await fetch(`${BASE_URL}/api/envases`);
  if (!r.ok) throw new Error("No se pudo leer /api/envases");
  return r.json();
}
async function getCategorias(): Promise<Categoria[]> {
  const r = await fetch(`${BASE_URL}/api/envases/categorias`);
  if (!r.ok) throw new Error("No se pudo leer /api/envases/categorias");
  return r.json();
}
async function postCategoria(nombre: string): Promise<Categoria> {
  const r = await fetch(`${BASE_URL}/api/envases/categorias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "No se pudo crear la sección");
  return data;
}
async function deleteCategoria(nombre: string): Promise<void> {
  const r = await fetch(`${BASE_URL}/api/envases/categorias/${encodeURIComponent(nombre)}`, {
    method: "DELETE",
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "No se pudo borrar la sección");
}
async function deleteEnvase(id: string): Promise<void> {
  const r = await fetch(`${BASE_URL}/api/envases/${id}`, { method: "DELETE" });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "No se pudo borrar el envase");
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
  saborIds: string[],
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

// NUEVO: crear envase global en catálogo
async function postEnvase(payload: { tipoEnvase: string; maxCantSabores: number; categoria: string }) {
  const r = await fetch(`${BASE_URL}/api/envases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "No se pudo crear el envase");
  return data as Envase;
}

async function confirmAsync(title: string, message: string, confirmLabel: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
      { text: confirmLabel, style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

// ===== helper de rotulado (solo estética, independiente de la sección) =====
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
  // especiales: mostramos tal cual
  return tipoEnvase.replace("_", " ");
}
// ===================================================

export default function Vendedor_Envases() {
  const { sucursalId: qp } = useLocalSearchParams<{ sucursalId?: string }>();
  const router = useRouter();
  const sucursalId = String(qp || "S1234");
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [catalogoEnvases, setCatalogoEnvases] = useState<Envase[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [seleccionEnvases, setSeleccionEnvases] = useState<Set<string>>(new Set());
  const [seleccionSabores, setSeleccionSabores] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const [abierto, setAbierto] = useState<Record<string, boolean>>({});

  // NUEVO: inputs por grupo para crear envases
  type NuevoEnvaseInputs = {
    rest: string;           // "1", "2" (bolas), "0.25" (kilos) o libre para especiales
    max: string;            // número como string para TextInput
  };
  const [nuevoPorGrupo, setNuevoPorGrupo] = useState<Record<string, NuevoEnvaseInputs>>({});
  const [nuevaSeccion, setNuevaSeccion] = useState("");

  const onChangeNuevo = (g: string, field: keyof NuevoEnvaseInputs, v: string) =>
    setNuevoPorGrupo((prev) => {
      const actual = prev[g] ?? { rest: "", max: "" };
      return { ...prev, [g]: { ...actual, [field]: v } };
    });

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [envases, oferta, cats] = await Promise.all([
        getCatalogoEnvases(),
        getOferta(sucursalId),
        getCategorias(),
      ]);
      setCatalogoEnvases(envases);
      setCategorias(cats);
      setSeleccionEnvases(new Set((oferta.envases ?? []).map((e) => e.id)));
      setSeleccionSabores(new Set((oferta.sabores ?? []).map((s) => s.id)));
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo cargar la oferta");
    } finally {
      setLoading(false);
    }
  }, [sucursalId]);

  useEffect(() => { cargar(); }, [cargar]);

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

  // Crear envase en el catálogo, dentro de la sección donde se tocó "+ Agregar"
  const crearEnvaseEnGrupo = async (g: string) => {
    const { rest, max } = nuevoPorGrupo[g] ?? { rest: "", max: "" };
    const maxNum = Number(max);

    if (!rest.trim()) {
      Alert.alert(
        "Dato requerido",
        g === "Kilo" ? "Ingresá 1, 0.5 o 0.25" :
        g === "Conos" || g === "Vasos" ? "Ingresá la cantidad de bolas" :
        "Ingresá un nombre para el envase"
      );
      return;
    }
    if (!Number.isFinite(maxNum) || maxNum <= 0) {
      Alert.alert("Dato requerido", "Ingresá la cantidad máxima de sabores (número > 0).");
      return;
    }

    // Construcción de tipoEnvase según convención actual (solo para las 3
    // secciones "de fábrica"); en cualquier otra sección (incluida
    // "Especiales" y las que cree el vendedor) se usa el nombre tal cual,
    // sin anteponer ningún prefijo.
    const kind =
      g === "Conos" ? "cucurucho" :
      g === "Vasos" ? "vaso" :
      g === "Kilo" ? "kilo" :
      null;

    // Normalizamos rest para Kilo (permitimos 1, 0.5, 0.25)
    const restNorm = g === "Kilo"
      ? (rest === "1/2" ? "0.5" : rest.replace(",", "."))
      : rest;

    const tipoEnvase = kind ? `${kind}_${restNorm}` : restNorm.trim();

    try {
      await postEnvase({ tipoEnvase, maxCantSabores: maxNum, categoria: g });
      await cargar();
      setNuevoPorGrupo((prev) => ({ ...prev, [g]: { rest: "", max: "" } }));
      Alert.alert("Listo", `Se agregó "${labelFor(tipoEnvase)}" en "${g}".`);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo crear el envase");
    }
  };

  const crearSeccion = async () => {
    const nombre = nuevaSeccion.trim();
    if (!nombre) {
      Alert.alert("Nombre requerido", "Ingresá un nombre para la nueva sección.");
      return;
    }
    try {
      await postCategoria(nombre);
      setNuevaSeccion("");
      await cargar();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo crear la sección");
    }
  };

  const borrarSeccion = async (nombre: string) => {
    const ok = await confirmAsync(
      "Borrar sección",
      `¿Borrar la sección "${nombre}"? Los envases que tenga pasan a "${CATEGORIA_FALLBACK}".`,
      "Borrar"
    );
    if (!ok) return;
    try {
      await deleteCategoria(nombre);
      await cargar();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo borrar la sección");
    }
  };

  const borrarEnvase = async (envase: Envase) => {
    const ok = await confirmAsync(
      "Borrar envase",
      `¿Borrar "${labelFor(envase.tipoEnvase)}" del catálogo? Esta acción no se puede deshacer.`,
      "Borrar"
    );
    if (!ok) return;
    try {
      await deleteEnvase(envase.id);
      await cargar();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo borrar el envase");
    }
  };

  const irAPedidos = () =>
    router.push({ pathname: "/screens/proveedor/Pedidos_Sucursal", params: { sucursalId } });

  const nombresCategorias = useMemo(() => categorias.map((c) => c.nombre), [categorias]);

  const grupos = useMemo(() => {
    const map: Record<string, Envase[]> = {};
    for (const nombre of nombresCategorias) map[nombre] = [];
    for (const e of catalogoEnvases) {
      const g = map[e.categoria] ? e.categoria : CATEGORIA_FALLBACK;
      if (!map[g]) map[g] = [];
      map[g].push(e);
    }
    Object.keys(map).forEach((g) =>
      map[g].sort((a, b) => labelFor(a.tipoEnvase).localeCompare(labelFor(b.tipoEnvase)))
    );
    return map;
  }, [catalogoEnvases, nombresCategorias]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando envases...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{ padding: 16, paddingTop: insets.top + 16, borderBottomWidth: 1, borderColor: "#eee", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "800", textAlign: "center" }}>
          Envases ofrecidos
        </Text>
      </View>

      {/* Contenido */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {nombresCategorias.map((g) => (
          <View key={g} style={{ marginBottom: 12 }}>
            <TouchableOpacity
              onPress={() => setAbierto((prev) => ({ ...prev, [g]: !prev[g] }))}
              style={{
                padding: 12,
                backgroundColor: "#f7f7f7",
                borderRadius: 8,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontWeight: "800" }}>{g}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                {g !== CATEGORIA_FALLBACK && (
                  <Pressable onPress={() => borrarSeccion(g)} hitSlop={8}>
                    <Text style={{ color: "#c0392b", fontWeight: "700" }}>Borrar</Text>
                  </Pressable>
                )}
                <Text>{abierto[g] ? "▲" : "▼"}</Text>
              </View>
            </TouchableOpacity>

            {abierto[g] &&
              (grupos[g] ?? []).map((item) => {
                const checked = seleccionEnvases.has(item.id);
                return (
                  <View
                    key={item.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 6,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: checked ? "#1e90ff" : "#ddd",
                      backgroundColor: checked ? "#eaf3ff" : "#fff",
                    }}
                  >
                    <Pressable onPress={() => toggleEnvase(item.id)} style={{ flex: 1, padding: 12 }}>
                      <Text style={{ fontWeight: "700" }}>{labelFor(item.tipoEnvase)}</Text>
                      <Text style={{ opacity: 0.7 }}>Máx. sabores: {item.maxCantSabores}</Text>
                    </Pressable>
                    <Pressable onPress={() => borrarEnvase(item)} style={{ paddingHorizontal: 14 }} hitSlop={8}>
                      <Text style={{ color: "#c0392b", fontWeight: "700" }}>Borrar</Text>
                    </Pressable>
                  </View>
                );
              })}

            {/* input + botón para crear envase en este grupo */}
            {abierto[g] && (
              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <TextInput
                    placeholder={
                      g === "Kilo"
                        ? "Cantidad (1, 0.5, 0.25)"
                        : g === "Conos" || g === "Vasos"
                        ? "Bolas (1, 2, 3, 4)"
                        : "Nombre del envase"
                    }
                    keyboardType={g === "Kilo" || g === "Conos" || g === "Vasos" ? "numeric" : "default"}
                    value={nuevoPorGrupo[g]?.rest ?? ""}
                    onChangeText={(v) => onChangeNuevo(g, "rest", v)}
                    autoCapitalize="none"
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 12,
                      backgroundColor: "#fff",
                    }}
                  />
                  <TextInput
                    placeholder="Máx. sabores"
                    keyboardType="numeric"
                    value={nuevoPorGrupo[g]?.max ?? ""}
                    onChangeText={(v) => onChangeNuevo(g, "max", v)}
                    style={{
                      width: 120,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 12,
                      backgroundColor: "#fff",
                    }}
                  />
                  <Pressable
                    onPress={() => crearEnvaseEnGrupo(g)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 12,
                      backgroundColor: "#1e90ff",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>+ Agregar</Text>
                  </Pressable>
                </View>
                <Text style={{ marginTop: 6, fontSize: 12, opacity: 0.6 }}>
                  El nuevo envase se guarda en el catálogo global y luego podés activarlo para esta
                  sucursal.
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Crear una sección nueva */}
        <View
          style={{
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#eee",
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontWeight: "800", marginBottom: 8 }}>Nueva sección</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TextInput
              placeholder="Ej: Sin TACC"
              value={nuevaSeccion}
              onChangeText={setNuevaSeccion}
              autoCapitalize="none"
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 12,
                backgroundColor: "#fff",
              }}
            />
            <Pressable
              onPress={crearSeccion}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: "#222",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>+ Crear</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 20,
          left: 16,
          right: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <Pressable
          onPress={irAPedidos}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            backgroundColor: "#222",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Volver a Pedidos</Text>
        </Pressable>
      </View>
    </View>
  );
}
