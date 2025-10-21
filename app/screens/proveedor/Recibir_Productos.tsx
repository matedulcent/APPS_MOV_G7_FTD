// Recibir_Productos.tsx
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

type Envase = { id: string; tipoEnvase: string; maxCantSabores: number };
type Sabor  = { id: string; tipoSabor: string };

const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3001" : "http://localhost:3001";

async function getOferta(sucursalId: string): Promise<{ envases: Envase[]; sabores: Sabor[] }> {
  const r = await fetch(`${BASE_URL}/api/sucursales/${sucursalId}/oferta`);
  if (!r.ok) throw new Error("No se pudo leer oferta de sucursal");
  return r.json();
}

export default function Recibir_Productos() {
  const { sucursalId: qp } = useLocalSearchParams<{ sucursalId?: string }>();
  const sucursalId = qp || "S1234";

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [envases, setEnvases] = useState<Envase[]>([]);
  const [sabores, setSabores] = useState<Sabor[]>([]);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const oferta = await getOferta(String(sucursalId));
      setEnvases(oferta.envases ?? []);
      setSabores(oferta.sabores ?? []);
      console.log("[GET] oferta:", oferta);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo cargar la oferta");
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

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando oferta...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8 }}>
        Oferta actual — Sucursal {String(sucursalId)}
      </Text>

      <Text style={{ fontSize: 16, fontWeight: "700", marginTop: 8, marginBottom: 6 }}>
        Envases
      </Text>
      {envases.length === 0 ? (
        <Text style={{ opacity: 0.6 }}>No hay envases configurados.</Text>
      ) : (
        envases.map((e) => (
          <View
            key={e.id}
            style={{
              padding: 10,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 10,
              marginBottom: 8,
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ fontWeight: "700" }}>{e.tipoEnvase}</Text>
            <Text style={{ opacity: 0.7, fontSize: 12 }}>
              Máx. sabores: {e.maxCantSabores}
            </Text>
          </View>
        ))
      )}

      <Text style={{ fontSize: 16, fontWeight: "700", marginTop: 16, marginBottom: 6 }}>
        Sabores
      </Text>
      {sabores.length === 0 ? (
        <Text style={{ opacity: 0.6 }}>No hay sabores configurados.</Text>
      ) : (
        sabores.map((s) => (
          <View
            key={s.id}
            style={{
              padding: 10,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 10,
              marginBottom: 8,
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ fontWeight: "700" }}>{s.tipoSabor}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
