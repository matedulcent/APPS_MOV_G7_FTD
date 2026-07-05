import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { INK, MINT, MUTED } from "../../../constants/brand";

const { width } = Dimensions.get("window");

export default function MostrarQR() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sucursalId, nombre } = useLocalSearchParams<{ sucursalId?: string; nombre?: string }>();

  const value = useMemo(
    () =>
      JSON.stringify({
        type: "heladeria-sucursal",
        sucursalId: String(sucursalId ?? ""),
        nombre: String(nombre ?? ""),
      }),
    [sucursalId, nombre]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}
        hitSlop={12}
      >
        <Ionicons name="close" size={26} color={INK} />
      </Pressable>

      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Ionicons name="qr-code" size={28} color={MINT} />
        </View>
        <Text style={styles.title}>{nombre || "Tu sucursal"}</Text>
        <Text style={styles.subtitle}>
          Mostrale esto al cliente para que escanee y elija esta sucursal automáticamente
        </Text>

        <View style={styles.qrCard}>
          <QRCode value={value} size={width * 0.62} color={INK} backgroundColor="#fff" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24 },
  closeButton: {
    alignSelf: "flex-end",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f5f5f7",
    alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#eafaf6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontSize: 24, fontWeight: "800", color: INK, textAlign: "center" },
  subtitle: {
    fontSize: 13.5,
    color: MUTED,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  qrCard: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
});
