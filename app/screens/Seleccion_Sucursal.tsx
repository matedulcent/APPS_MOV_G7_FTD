import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ActionButton from "../../components/ActionButton";
import ScreenHeader from "../../components/ScreenHeader";
import { BORDER, CARD_BG, DANGER, INK, MINT, MUTED, PINK } from "../../constants/brand";
import { setSucursal } from "../../redux/actions/userActions"; // <--- acción Redux
import type { RootState } from "../../redux/store";
import { BASE_URL } from "../services/apiConfig";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;

type UISucursal = { id: string; nombre: string; direccion: string; imagen: string };
type BackendSucursal = { id: string; nombre?: string | null; domicilio?: string | null; urlImagen?: string | null };

/**
 * La imagen puede ser una URL absoluta (vieja, alguien la pegó a mano) o una
 * ruta relativa "/uploads/xxx.jpg" (subida con ImagePicker), que hay que
 * completar con el BASE_URL actual — no se guarda la IP fija porque cambia
 * entre redes/sesiones. Valores viejos tipo "img1.png" no son servibles y
 * caen en el placeholder.
 */
const resolveImagenUri = (s?: string | null): string | null => {
  if (!s) return null;
  if (/^https?:\/\//.test(s)) return s;
  if (s.startsWith("/uploads/")) return `${BASE_URL}${s}`;
  return null;
};

export default function SeleccionSucursalScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  const [sucursalSeleccionada, setSucursalSeleccionadaLocal] = useState<string | null>(user.sucursalId ?? null);
  const [sucursales, setSucursales] = useState<UISucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    async function fetchSucursales() {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(`${BASE_URL}/api/sucursales`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data: BackendSucursal[] = await resp.json();

        const ui: UISucursal[] = (data || []).map((s) => ({
          id: s.id,
          nombre: s.nombre ?? "Sucursal sin nombre",
          direccion: s.domicilio ?? "Dirección no disponible",
          imagen: s.urlImagen ?? "",
        }));

        if (!cancelado) setSucursales(ui);
      } catch {
        if (!cancelado) setError("No se pudieron cargar las sucursales. Intenta nuevamente.");
      } finally {
        if (!cancelado) setLoading(false);
      }
    }

    fetchSucursales();
    return () => { cancelado = true; };
  }, []);

  const handleSeleccion = (sucursal: UISucursal) => {
    setSucursalSeleccionadaLocal(sucursal.id); // estado local para UI
    dispatch(setSucursal(sucursal.id));         // guardamos en Redux
    router.push("/screens/Categoria_Envase");   // redirige sin params
  };

  const renderSucursal = ({ item }: { item: UISucursal }) => {
    const isSelected = item.id === sucursalSeleccionada;
    const imagenUri = resolveImagenUri(item.imagen);
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isSelected && styles.cardSelected,
          pressed && { opacity: 0.85 },
        ]}
        onPress={() => handleSeleccion(item)}
      >
        {imagenUri ? (
          <Image source={{ uri: imagenUri }} style={styles.imagen} />
        ) : (
          <View style={[styles.imagen, styles.imagenPlaceholder]}>
            <Ionicons name="ice-cream" size={30} color={PINK} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.direccion}>{item.direccion}</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isSelected ? PINK : "#c6c6cf"}
        />
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
        <ScreenHeader title="Elegí tu heladería" />

        <View style={{ marginBottom: 14 }}>
          <ActionButton
            label="Escanear QR"
            icon="qr-code-outline"
            color={MINT}
            onPress={() => router.push("/screens/EscanearQR")}
          />
        </View>

        {loading && (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 20 }}>
            <ActivityIndicator size="large" color={PINK} />
            <Text style={{ marginTop: 8, color: MUTED }}>Cargando sucursales...</Text>
          </View>
        )}

        {!loading && error && <Text style={styles.errorText}>{error}</Text>}

        {!loading && !error && (
          <FlatList
            data={sucursales}
            keyExtractor={(item) => item.id}
            renderItem={renderSucursal}
            contentContainerStyle={{ paddingBottom: height * 0.15, paddingTop: 10 }}
          />
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, padding: 20, backgroundColor: "rgba(255,255,255,0.55)" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSelected: { borderColor: PINK, backgroundColor: "#fff0f6" },
  imagen: { width: 64, height: 64, borderRadius: 14, marginRight: 14 },
  imagenPlaceholder: { backgroundColor: "#fdeaf1", alignItems: "center", justifyContent: "center" },
  textContainer: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: "700", color: INK },
  direccion: { fontSize: 13, color: MUTED, marginTop: 3 },
  errorText: { color: DANGER, textAlign: "center", marginVertical: 20 },
});
