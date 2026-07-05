import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ActionButton from "../../components/ActionButton";
import { INK, MINT, MUTED, PINK } from "../../constants/brand";
import { setSucursal } from "../../redux/actions/userActions";
import { BASE_URL } from "../services/apiConfig";

type QrPayload = { type?: string; sucursalId?: string; nombre?: string };

export default function EscanearQR() {
  const router = useRouter();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [checking, setChecking] = useState(false);

  const volverAEscanear = () => {
    setScanned(false);
    setChecking(false);
  };

  const showError = (title: string, message: string) => {
    setChecking(false);
    Alert.alert(title, message, [{ text: "OK", onPress: volverAEscanear }]);
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || checking) return;
    setScanned(true);

    let payload: QrPayload;
    try {
      payload = JSON.parse(data);
    } catch {
      showError("QR inválido", "Este código no es de Helados Hermanos.");
      return;
    }

    if (payload?.type !== "heladeria-sucursal" || !payload.sucursalId) {
      showError("QR inválido", "Este código no es de una sucursal de Helados Hermanos.");
      return;
    }

    setChecking(true);
    try {
      const r = await fetch(`${BASE_URL}/api/sucursales/${payload.sucursalId}`);
      if (!r.ok) throw new Error("La sucursal ya no existe");
      const sucursal = await r.json();

      dispatch(setSucursal(sucursal.id));
      router.replace("/screens/Categoria_Envase");
    } catch (e: any) {
      showError("No se pudo abrir la sucursal", e?.message ?? "Intentá de nuevo.");
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={PINK} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 24, paddingHorizontal: 32 }]}>
        <Ionicons name="camera-outline" size={48} color={MUTED} style={{ marginBottom: 16 }} />
        <Text style={styles.permTitle}>Necesitamos la cámara</Text>
        <Text style={styles.permText}>
          Para escanear el QR de la sucursal y elegirla automáticamente.
        </Text>
        <View style={{ marginTop: 20, width: "100%" }}>
          <ActionButton label="Dar permiso" icon="camera-outline" onPress={requestPermission} />
          <View style={{ height: 10 }} />
          <ActionButton label="Volver" icon="arrow-back" variant="outline" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      <View style={[styles.overlay, { paddingTop: insets.top + 16 }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}
          hitSlop={12}
        >
          <Ionicons name="close" size={26} color="#fff" />
        </Pressable>

        <Text style={styles.title}>Escaneá el QR de la sucursal</Text>

        <View style={styles.frameWrap}>
          <View style={[styles.frame, checking && { borderColor: MINT }]} />
        </View>

        {checking && (
          <View style={styles.checkingBox}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.checkingText}>Abriendo sucursal...</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  permTitle: { fontSize: 20, fontWeight: "800", color: INK, textAlign: "center" },
  permText: { fontSize: 14, color: MUTED, textAlign: "center", marginTop: 8 },
  overlay: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 24,
    textAlign: "center",
  },
  frameWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  frame: {
    width: 240,
    height: 240,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.85)",
  },
  checkingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 40,
  },
  checkingText: { color: "#fff", fontWeight: "600" },
});
