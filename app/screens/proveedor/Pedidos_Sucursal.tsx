import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

type Envase = { id: string; tipoEnvase: string; maxCantSabores: number };
type Sabor  = { id: string; tipoSabor: string };
type Contenido = { id: number; envase: Envase | null; sabor: Sabor | null };
type OrdenLite = {
  id: string;
  fecha?: string | null;
  estadoTerminado: boolean;
  sucursalId: string;
  usuarioId: string;
};
type OrdenFull = OrdenLite & { contenidos: Contenido[] };

const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3001" : "http://localhost:3001";

/** API helpers con tus endpoints actuales */
async function fetchOrdenes(take = 50): Promise<OrdenLite[]> {
  const r = await fetch(`${BASE_URL}/api/ordenes?take=${take}`);
  if (!r.ok) throw new Error("No se pudo leer /api/ordenes");
  return r.json();
}
async function fetchOrdenDetalle(id: string): Promise<OrdenFull> {
  const r = await fetch(`${BASE_URL}/api/ordenes/${id}`);
  if (!r.ok) throw new Error(`No se pudo leer /api/ordenes/${id}`);
  return r.json();
}

export default function Pedidos_Sucursal() {
  const { sucursalId: qp } = useLocalSearchParams<{ sucursalId?: string }>();
  const router = useRouter();
  const sucursalId = String(qp || "S1234");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pedidos, setPedidos] = useState<OrdenFull[]>([]);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      // 1) Traer últimas N (sin relaciones)
      const all = await fetchOrdenes(50);
      // 2) Filtrar por sucursal en el front
      const mias = all.filter((o) => o.sucursalId === sucursalId);
      // 3) Obtener detalles (contenidos -> envase + sabor)
      const detalles = await Promise.all(
        mias.map((o) => fetchOrdenDetalle(o.id).catch(() => null))
      );
      const list = (detalles.filter(Boolean) as OrdenFull[]).sort((a, b) => {
        const ta = a.fecha ? new Date(a.fecha).getTime() : 0;
        const tb = b.fecha ? new Date(b.fecha).getTime() : 0;
        return tb - ta || b.id.localeCompare(a.id);
      });
      setPedidos(list);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudieron cargar los pedidos");
    } finally {
      setLoading(false);
    }
  }, [sucursalId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await cargar();
    } finally {
      setRefreshing(false);
    }
  }, [cargar]);

  const irAEditarEnvases = () =>
    router.push({ pathname: "/screens/proveedor/Vendedor_Envases", params: { sucursalId } });

  const irAEditarGustos = () =>
    router.push({ pathname: "/screens/proveedor/Vendedor_Productos", params: { sucursalId } });

  /* ====== UI ====== */

    if (loading) {
    return (
        <View
        style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        }}
        >
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={{ marginTop: 8, fontSize: 16 }}>Cargando pedidos...</Text>
        </View>
    );
    }


  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8 }}>
        Pedidos — Sucursal {sucursalId}
      </Text>

      {pedidos.length === 0 ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <Text style={{ opacity: 0.6 }}>No hay pedidos por ahora.</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(p) => p.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const fecha = item.fecha ? new Date(item.fecha).toLocaleString() : "—";
            return (
              <View
                style={{
                  padding: 12,
                  marginBottom: 10,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: "#ddd",
                  backgroundColor: "#fff",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ fontWeight: "800" }}>Pedido #{item.id}</Text>
                  <Text
                    style={{
                      fontWeight: "700",
                      color: item.estadoTerminado ? "#2e7d32" : "#e67e22",
                    }}
                  >
                    {item.estadoTerminado ? "Terminado" : "Pendiente"}
                  </Text>
                </View>

                <Text style={{ opacity: 0.7, marginBottom: 8 }}>{fecha}</Text>

                {item.contenidos?.length ? (
                  item.contenidos.map((c) => (
                    <View
                      key={c.id}
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#e6e6e6",
                        backgroundColor: "#f9fbff",
                        marginBottom: 6,
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>
                        {c.envase?.tipoEnvase?.replaceAll("_", " ") ?? "Envase"}
                      </Text>
                      <Text style={{ opacity: 0.75, fontSize: 12 }}>
                        Sabor: {c.sabor?.tipoSabor ?? "—"}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ opacity: 0.6 }}>Sin contenidos.</Text>
                )}
              </View>
            );
          }}
        />
      )}

      {/* Botonera inferior */}
      <View style={{ gap: 10, marginTop: 8 }}>
        <Pressable
          onPress={irAEditarEnvases}
          style={{
            padding: 14,
            borderRadius: 14,
            alignItems: "center",
            backgroundColor: "#1e90ff",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Editar envases
          </Text>
        </Pressable>

        <Pressable
          onPress={irAEditarGustos}
          style={{
            padding: 14,
            borderRadius: 14,
            alignItems: "center",
            backgroundColor: "#222",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Editar gustos
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
