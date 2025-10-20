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

async function getCatalogoSabores(): Promise<Sabor[]> {
  const r = await fetch(`${BASE_URL}/api/sabores`);
  if (!r.ok) throw new Error("No se pudo leer /api/sabores");
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

export default function Vendedor_Productos() {
  const { sucursalId: qp } = useLocalSearchParams<{ sucursalId?: string }>();
  const router = useRouter();
  const sucursalId = String(qp || "S1234");

  const [loading, setLoading] = useState(true);
  const [catalogoSabores, setCatalogoSabores] = useState<Sabor[]>([]);
  const [seleccionSabores, setSeleccionSabores] = useState<Set<string>>(new Set());
  const [seleccionEnvases, setSeleccionEnvases] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

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

  useEffect(() => { cargar(); }, [cargar]);

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

  const irAEditarEnvases = () =>
    router.push({ pathname: "/screens/proveedor/Vendedor_Envases", params: { sucursalId } });

  const irAPedidos = () =>
    router.push({ pathname: "/screens/proveedor/Pedidos_Sucursal", params: { sucursalId } });

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando gustos...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        Sabores ofrecidos — Sucursal {sucursalId}
      </Text>

      <FlatList
        data={catalogoSabores}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => {
          const checked = seleccionSabores.has(item.id);
          return (
            <Pressable
              onPress={() => toggleSabor(item.id)}
              style={{
                padding: 12,
                marginBottom: 8,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: checked ? "#1e90ff" : "#ddd",
                backgroundColor: checked ? "#eaf3ff" : "#fff",
              }}
            >
              <Text style={{ fontWeight: "700" }}>{item.tipoSabor}</Text>
              <Text style={{ marginTop: 6, fontSize: 12, opacity: 0.6 }}>
                Tocar para {checked ? "quitar" : "agregar"} este sabor a la oferta
              </Text>
            </Pressable>
          );
        }}
      />

      <View style={{ gap: 10, marginTop: 4 }}>
        <Pressable
          onPress={irAEditarEnvases}
          style={{ padding: 14, borderRadius: 14, alignItems: "center", backgroundColor: "#1e90ff" }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Editar envases</Text>
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
