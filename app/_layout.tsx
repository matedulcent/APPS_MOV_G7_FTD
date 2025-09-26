// app/_layout.tsx
import PedidoCard from "@/components/PedidoCard"; // 👈 tu tarjeta de pedido
import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function Layout() {
  return (
    <View style={styles.container}>
      {/* Resto de la navegación */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* PedidoCard siempre visible abajo */}
      <PedidoCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
