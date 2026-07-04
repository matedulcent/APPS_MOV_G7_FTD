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

type Envase = { id: string; tipoEnvase: string; maxCantSabores: number };
type Sabor = { id: string; tipoSabor: string; categoria: string };
type Categoria = { id: string; nombre: string };

const CATEGORIA_FALLBACK = "Especiales";

async function getCatalogoSabores(): Promise<Sabor[]> {
  const r = await fetch(`${BASE_URL}/api/sabores`);
  if (!r.ok) throw new Error("No se pudo leer /api/sabores");
  return r.json();
}
async function getCategorias(): Promise<Categoria[]> {
  const r = await fetch(`${BASE_URL}/api/sabores/categorias`);
  if (!r.ok) throw new Error("No se pudo leer /api/sabores/categorias");
  return r.json();
}
async function postCategoria(nombre: string): Promise<Categoria> {
  const r = await fetch(`${BASE_URL}/api/sabores/categorias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "No se pudo crear la sección");
  return data;
}
async function deleteCategoria(nombre: string): Promise<void> {
  const r = await fetch(`${BASE_URL}/api/sabores/categorias/${encodeURIComponent(nombre)}`, {
    method: "DELETE",
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "No se pudo borrar la sección");
}
async function deleteSabor(id: string): Promise<void> {
  const r = await fetch(`${BASE_URL}/api/sabores/${id}`, { method: "DELETE" });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "No se pudo borrar el sabor");
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

// NUEVO: crear sabor global (nombre + sección)
async function postSabor(payload: { tipoSabor: string; categoria: string }) {
  const r = await fetch(`${BASE_URL}/api/sabores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "No se pudo crear el sabor");
  return data as Sabor;
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

export default function Vendedor_Productos() {
  const { sucursalId: qp } = useLocalSearchParams<{ sucursalId?: string }>();
  const router = useRouter();
  const sucursalId = String(qp || "S1234");
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [catalogoSabores, setCatalogoSabores] = useState<Sabor[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [seleccionSabores, setSeleccionSabores] = useState<Set<string>>(new Set());
  const [seleccionEnvases, setSeleccionEnvases] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const [abierto, setAbierto] = useState<Record<string, boolean>>({});
  const [nuevoSaborPorGrupo, setNuevoSaborPorGrupo] = useState<Record<string, string>>({});
  const [nuevaSeccion, setNuevaSeccion] = useState("");

  const onChangeNuevoSabor = (g: string, v: string) =>
    setNuevoSaborPorGrupo((prev) => ({ ...prev, [g]: v }));

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [sabores, oferta, cats] = await Promise.all([
        getCatalogoSabores(),
        getOferta(sucursalId),
        getCategorias(),
      ]);
      setCatalogoSabores(sabores);
      setCategorias(cats);
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

  // Crear gusto en el catálogo, dentro de la sección donde se tocó "+ Agregar"
  const crearSaborEnGrupo = async (g: string) => {
    const nombre = (nuevoSaborPorGrupo[g] || "").trim();
    if (!nombre) {
      Alert.alert("Nombre requerido", "Ingresá un nombre para el nuevo gusto.");
      return;
    }
    try {
      await postSabor({ tipoSabor: nombre, categoria: g });
      await cargar();
      setNuevoSaborPorGrupo((prev) => ({ ...prev, [g]: "" }));
      Alert.alert("Listo", `Se agregó "${nombre}" en "${g}".`);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo crear el sabor");
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
      `¿Borrar la sección "${nombre}"? Los gustos que tenga pasan a "${CATEGORIA_FALLBACK}".`,
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

  const borrarSabor = async (sabor: Sabor) => {
    const ok = await confirmAsync(
      "Borrar sabor",
      `¿Borrar "${sabor.tipoSabor}" del catálogo? Esta acción no se puede deshacer.`,
      "Borrar"
    );
    if (!ok) return;
    try {
      await deleteSabor(sabor.id);
      await cargar();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo borrar el sabor");
    }
  };

  const irAPedidos = () =>
    router.push({
      pathname: "/screens/proveedor/Pedidos_Sucursal",
      params: { sucursalId },
    });

  const nombresCategorias = useMemo(() => categorias.map((c) => c.nombre), [categorias]);

  const grupos = useMemo(() => {
    const map: Record<string, Sabor[]> = {};
    for (const nombre of nombresCategorias) map[nombre] = [];
    for (const s of catalogoSabores) {
      const g = map[s.categoria] ? s.categoria : CATEGORIA_FALLBACK;
      if (!map[g]) map[g] = [];
      map[g].push(s);
    }
    Object.keys(map).forEach((g) => map[g].sort((a, b) => a.tipoSabor.localeCompare(b.tipoSabor)));
    return map;
  }, [catalogoSabores, nombresCategorias]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando gustos...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16, gap: 12 }}>
      {/* TÍTULO CENTRADO */}
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: "900", textAlign: "center" }}>
          Gustos ofrecidos
        </Text>
      </View>

      {/* Contenido principal */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 12 }}>
        {nombresCategorias.map((g) => (
          <View
            key={g}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#e6e6e6",
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => setAbierto((prev) => ({ ...prev, [g]: !prev[g] }))}
              style={{
                padding: 12,
                backgroundColor: "#f5f5f5",
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
                <Text style={{ opacity: 0.7 }}>{abierto[g] ? "▲" : "▼"}</Text>
              </View>
            </TouchableOpacity>

            {abierto[g] &&
              (grupos[g] ?? []).map((item) => {
                const checked = seleccionSabores.has(item.id);
                return (
                  <View
                    key={item.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      margin: 8,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: checked ? "#1e90ff" : "#ddd",
                      backgroundColor: checked ? "#eaf3ff" : "#fff",
                    }}
                  >
                    <Pressable onPress={() => toggleSabor(item.id)} style={{ flex: 1, padding: 12 }}>
                      <Text style={{ fontWeight: "700" }}>{item.tipoSabor}</Text>
                      <Text style={{ marginTop: 6, fontSize: 12, opacity: 0.6 }}>
                        Tocar para {checked ? "quitar" : "agregar"} este sabor a la oferta
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => borrarSabor(item)} style={{ paddingHorizontal: 14 }} hitSlop={8}>
                      <Text style={{ color: "#c0392b", fontWeight: "700" }}>Borrar</Text>
                    </Pressable>
                  </View>
                );
              })}

            {/* input + botón para crear gusto en este grupo */}
            {abierto[g] && (
              <View style={{ paddingHorizontal: 8, paddingBottom: 12 }}>
                <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <TextInput
                    placeholder={`Nuevo gusto en ${g}`}
                    value={nuevoSaborPorGrupo[g] ?? ""}
                    onChangeText={(v) => onChangeNuevoSabor(g, v)}
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
                    onPress={() => crearSaborEnGrupo(g)}
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
                  El nuevo gusto se guarda en el catálogo global y luego podés activarlo
                  para esta sucursal.
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Crear una sección nueva */}
        <View
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e6e6e6",
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontWeight: "800", marginBottom: 8 }}>Nueva sección</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TextInput
              placeholder="Ej: Sin azúcar"
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

      {/* Botones al pie */}
      <View style={{ gap: 10, marginTop: 4 }}>
        <Pressable
          onPress={irAPedidos}
          style={{
            padding: 14,
            borderRadius: 14,
            alignItems: "center",
            backgroundColor: "#222",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Volver a Pedidos
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
