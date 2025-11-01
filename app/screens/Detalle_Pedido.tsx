import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BASE_URL } from "../services/apiConfig";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isWeb = Platform.OS === "web";

/** === Helpers de API y mapeo === */

type PedidoItem = { envaseId: string; saborId: string };

async function crearOrden(payload: {
  usuarioId: string;
  sucursalId: string;
  items: PedidoItem[];
}) {
  const r = await fetch(`${BASE_URL}/api/ordenes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(`Error ${r.status}: ${msg || "No se pudo crear la orden"}`);
  }
  return (await r.json()) as { ok: boolean; ordenId: string; data?: any };
}

/** Mapea la clave de envase que muestra tu UI -> ID real de DB (B1..B11) */
function mapEnvaseKeyToId(key: string): string {
  // Posibles formatos que maneja tu app: "Cucuruchos 2 (2 bolas)", "Kilos 1 (1/4 Kg)", "Vasos 1 (3 bolas)"
  const [categoria] = key.split(" ");
  if (categoria === "Cucuruchos" || categoria === "Cucurucho") {
    const bolas = parseInt(key.match(/\((\d)\s+bolas?\)/)?.[1] ?? "1", 10);
    return { 1: "B1", 2: "B2", 3: "B3", 4: "B4" }[bolas] ?? "B1";
  }
  if (categoria === "Vasos" || categoria === "Vaso") {
    const bolas = parseInt(key.match(/\((\d)\s+bolas?\)/)?.[1] ?? "1", 10);
    return { 1: "B8", 2: "B9", 3: "B10", 4: "B11" }[bolas] ?? "B8";
  }
  if (categoria === "Kilos" || categoria === "Kilo") {
    const opt = key.match(/\(([^)]+)\)/)?.[1]?.trim();
    if (opt === "1/4 Kg") return "B6";
    if (opt === "1/2 Kg") return "B5";
    if (opt === "1 Kg") return "B7";
  }
  // fallback seguro
  return "B1";
}

/** Mapea el nombre de sabor que viene de la UI -> ID real de DB (F1..F20, 1 a 1) */
function mapSaborNameToId(name: string): string | null {
  const n = name.trim().toLowerCase();
  const alias: Record<string, string> = {
    "frutilla": "F1",

    "chocolate": "F2",
    "choco blanco": "F3",
    "chocolate amargo": "F4",
    "chocolate con almendras": "F5",
    "choco menta": "F6",

    "ron": "F7",
    "ron con pasas": "F8",

    "vainilla": "F9",

    "cacahuate": "F10",
    "maní": "F11",

    "pistacho": "F12",

    "crema cielo": "F13",

    "crema": "F14",
    "yogur": "F15",

    "ddl": "F16",
    "dulce de leche": "F17",
    "caramelo": "F18",

    "americana": "F19",
    "crema americana": "F20",
    "banana": "F21",
  };
  return alias[n] ?? null;
}

export default function DetallePedidoScreen() {
  const { pedido, sucursalId, userId } = useLocalSearchParams<{
    pedido: string;
    sucursalId: string;
    userId: string;
  }>();
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  const pedidoObj: { [key: string]: string[] } = useMemo(
    () => (pedido ? JSON.parse(decodeURIComponent(pedido)) : {}),
    [pedido]
  );

  console.log("##########################################################################");
  console.log("(DETALLE) SUCURSAL ID:", sucursalId);
  console.log("(DETALLE) Usuario ID:", userId);
  console.log("(DETALLE) Pedido completo:", pedido);
  console.log("##########################################################################");

  const handleConfirmar = async () => {
    try {
      if (!userId || !sucursalId) {
        Alert.alert("Faltan datos", "No hay usuario o sucursal seleccionada.");
        return;
      }

      // Construyo items [{envaseId, saborId}] a partir de pedidoObj
      const items: PedidoItem[] = [];
      const saboresSinMapeo: string[] = [];

      for (const [envaseKey, gustos] of Object.entries(pedidoObj)) {
        const envaseId = mapEnvaseKeyToId(envaseKey);
        for (const g of gustos) {
          const saborId = mapSaborNameToId(g);
          if (!saborId) {
            saboresSinMapeo.push(g);
            continue;
          }
          items.push({ envaseId, saborId });
        }
      }

      if (saboresSinMapeo.length) {
        Alert.alert(
          "Sabores no reconocidos",
          `No se pudieron mapear: ${saboresSinMapeo.join(", ")}`
        );
        return;
      }

      if (items.length === 0) {
        Alert.alert("Pedido vacío", "No hay ítems válidos para guardar.");
        return;
      }

      setEnviando(true);

      const res = await crearOrden({
        usuarioId: String(userId),
        sucursalId: String(sucursalId),
        items,
      });

      // Navegá a Número_Orden con el ID real
      router.push({
        pathname: "/screens/Numero_Orden",
        params: { pedido, sucursalId, userId, ordenId: res.ordenId },
      });
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e?.message ?? "No se pudo crear la orden.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo3.jpg")}
      style={styles.backgroundImage}
      resizeMode={isSmallScreen ? "stretch" : "cover"}
    >
      <View style={styles.overlay}>
        <View style={styles.ticket}>
          <View style={styles.ticketNotch} />
          <Text style={styles.title}>Detalle del Pedido</Text>

          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {Object.entries(pedidoObj).map(([cucurucho, gustos]) => (
              <View key={cucurucho} style={{ marginBottom: height * 0.015 }}>
                <Text style={styles.cucuruchoTitle}>{cucurucho}</Text>
                {gustos.map((gusto, i) => (
                  <Text key={i} style={styles.item}>
                    🍦 {gusto}
                  </Text>
                ))}
              </View>
            ))}
          </ScrollView>

          <View style={{ marginTop: 10 }}>
            <Pressable
              style={[
                styles.button,
                { backgroundColor: enviando ? "#8fdede" : "#42e9e9ff" },
              ]}
              onPress={handleConfirmar}
              disabled={enviando}
            >
              {enviando ? (
                <ActivityIndicator />
              ) : (
                <Text
                  style={[styles.buttonText, { fontSize: isWeb ? 18 : width * 0.045 }]}
                >
                  Confirmar Pedido
                </Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.button, { backgroundColor: "#f4679fff", marginTop: 10 }]}
              onPress={() => router.back()}
              disabled={enviando}
            >
              <Text style={[styles.buttonText, { fontSize: isWeb ? 16 : width * 0.04 }]}>
                Volver
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: isWeb ? 40 : width * 0.05,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  ticket: {
    width: "90%",
    backgroundColor: "#fff8e1",
    borderRadius: 16,
    padding: isWeb ? 20 : width * 0.05,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    flex: 1,
  },
  ticketNotch: {
    width: isWeb ? 40 : width * 0.12,
    height: isWeb ? 5 : height * 0.008,
    backgroundColor: "#ffd54f",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: isWeb ? 22 : width * 0.055,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: height * 0.02, // más cerca del contenido del ticket
  },
  cucuruchoTitle: {
    fontSize: isWeb ? 18 : width * 0.045,
    fontWeight: "bold",
    marginBottom: height * 0.005,
    textAlign: "center", // opcional: centrado por cucurucho
  },
  content: {
    flexGrow: 1,
  },
  item: {
    fontSize: isWeb ? 16 : width * 0.04,
    marginLeft: width * 0.03,
    marginBottom: height * 0.005,
  },
  button: {
    paddingVertical: isWeb ? 12 : height * 0.02,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: isWeb ? 16 : width * 0.04,
  },
});