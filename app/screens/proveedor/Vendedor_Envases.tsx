import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    Pressable,
    Text,
    View,
} from "react-native";

type Envase = { id: string; tipoEnvase: string; maxCantSabores: number };
type Sabor  = { id: string; tipoSabor: string };

const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3001" : "http://localhost:3001";

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

export default function Vendedor_Envases() {
  const { sucursalId: qp } = useLocalSearchParams<{ sucursalId?: string }>();
  const router = useRouter();
  const sucursalId = String(qp || "S1234");

  const [loading, setLoading] = useState(true);
  const [catalogoEnvases, setCatalogoEnvases] = useState<Envase[]>([]);
  const [seleccionEnvases, setSeleccionEnvases] = useState<Set<string>>(new Set());
  const [seleccionSabores, setSeleccionSabores] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [envases, oferta] = await Promise.all([
        getCatalogoEnvases(),
        getOferta(sucursalId),
      ]);
      setCatalogoEnvases(envases);
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

  // 🔁 Navegación TIPADA con objeto { pathname, params }
  const irAEditarGustos = () =>
    router.push({ pathname: "/screens/proveedor/Vendedor_Productos", params: { sucursalId } });

  // 👉 Tu pantalla de pedidos es Recibir_Productos.tsx
  const irAPedidos = () =>
    router.push({ pathname: "/screens/proveedor/Pedidos_Sucursal", params: { sucursalId } });

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando envases...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        Envases ofrecidos — Sucursal {sucursalId}
      </Text>

      <FlatList
        data={catalogoEnvases}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => {
          const checked = seleccionEnvases.has(item.id);
          return (
            <Pressable
              onPress={() => toggleEnvase(item.id)}
              style={{
                padding: 12,
                marginBottom: 8,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: checked ? "#1e90ff" : "#ddd",
                backgroundColor: checked ? "#eaf3ff" : "#fff",
              }}
            >
              <Text style={{ fontWeight: "700" }}>{item.tipoEnvase.replace("_", " ")}</Text>
              <Text style={{ opacity: 0.7 }}>Máx. sabores: {item.maxCantSabores}</Text>
              <Text style={{ marginTop: 6, fontSize: 12, opacity: 0.6 }}>
                Tocar para {checked ? "quitar" : "agregar"} este envase a la oferta
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Botones al pie */}
      <View style={{ gap: 10, marginTop: 4 }}>
        <Pressable
          onPress={irAEditarGustos}
          style={{ padding: 14, borderRadius: 14, alignItems: "center", backgroundColor: "#1e90ff" }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Editar gustos</Text>
        </Pressable>

        <Pressable
          onPress={irAPedidos}
          style={{ padding: 14, borderRadius: 14, alignItems: "center", backgroundColor: "#222" }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Ver pedidos de la sucursal
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
