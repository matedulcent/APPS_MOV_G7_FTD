// app/screens/Seleccion_Sucursal.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ScreenHeader from "../../components/ScreenHeader";
import { BASE_URL } from "../services/apiConfig";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isWeb = Platform.OS === "web";

type UISucursal = {
  id: string;
  nombre: string;
  direccion: string;
  imagen: string;
};

type BackendSucursal = {
  id: string;          // ID_Sucursal mapeado por Prisma como "id"
  nombre?: string | null;
  domicilio?: string | null;
  urlImagen?: string | null;
  // ...otros campos que no usamos acá
};

const PLACEHOLDER_IMG = "https://placehold.co/160x160?text=Helados";

export default function SeleccionSucursalScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string | null>(null);

  const [sucursales, setSucursales] = useState<UISucursal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /** === Carga de sucursales desde el backend === */
  useEffect(() => {
    let cancelado = false;

    async function fetchSucursales() {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`${BASE_URL}/api/sucursales`, { method: "GET" });
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const data: BackendSucursal[] = await resp.json();

        const ui: UISucursal[] = (data || []).map((s) => ({
          id: s.id,
          nombre: s.nombre ?? "Sucursal sin nombre",
          direccion: s.domicilio ?? "Dirección no disponible",
          imagen: s.urlImagen ?? PLACEHOLDER_IMG,
        }));

        if (!cancelado) setSucursales(ui);
      } catch (e: any) {
        console.log("[Seleccion_Sucursal] Error cargando sucursales:", e?.message || e);
        if (!cancelado) setError("No se pudieron cargar las sucursales. Intenta nuevamente.");
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    fetchSucursales();
    return () => {
      cancelado = true;
    };
  }, []);

  const handleSeleccion = (sucursal: UISucursal) => {
    setSucursalSeleccionada(sucursal.id);
    console.log("##########################################################################");
    console.log("(SELECCION SUCURSAL) SUCURSAL ID:", sucursal.id);
    console.log("(SELECCION SUCURSAL) Usuario ID:", userId);
    router.push({
      pathname: "/screens/Categoria_Envase",
      params: { sucursalId: sucursal.id, userId },
    });
  };

  const renderSucursal = ({ item }: { item: UISucursal }) => {
    const isSelected = item.id === sucursalSeleccionada;
    return (
      <Pressable
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => handleSeleccion(item)}
      >
        <Image source={{ uri: item.imagen }} style={styles.imagen} />
        <View style={styles.textContainer}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.direccion}>{item.direccion}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo3.jpg")}
      style={styles.backgroundImage}
      resizeMode={isSmallScreen ? "stretch" : "cover"}
    >
      <View style={styles.overlay}>
        <ScreenHeader title="Seleccione su sucursal" />

        {/* Loading */}
        {loading && (
          <View style={{ paddingVertical: height * 0.02, alignItems: "center" }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 8 }}>Cargando sucursales...</Text>
          </View>
        )}

        {/* Error */}
        {!loading && error && (
          <View style={{ paddingVertical: height * 0.02 }}>
            <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
          </View>
        )}

        {/* Lista */}
        {!loading && !error && (
          <FlatList
            data={sucursales}
            keyExtractor={(item) => item.id}
            renderItem={renderSucursal}
            contentContainerStyle={{
              paddingBottom: height * 0.02,
              paddingTop: height * 0.01,
            }}
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    padding: isWeb ? 40 : width * 0.05,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: isWeb ? 16 : width * 0.04,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: height * 0.015,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardSelected: {
    borderColor: "#6200ee",
    backgroundColor: "#e0d7ff",
  },
  imagen: {
    width: isWeb ? 80 : width * 0.18,
    height: isWeb ? 80 : width * 0.18,
    borderRadius: 10,
    marginRight: isWeb ? 16 : width * 0.04,
  },
  textContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: isWeb ? 18 : width * 0.045,
    fontWeight: "bold",
  },
  direccion: {
    fontSize: isWeb ? 14 : width * 0.035,
    color: "#555",
    marginTop: height * 0.005,
  },
});
