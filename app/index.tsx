import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import NavButton from "../components/NavButton";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <NavButton
        text="Ir a Gustos"
        onPress={() => router.push("/screens/Categoria_Volumen")}
      />
      <Text style={styles.text}>🏠 Esta es la pantalla Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-start", padding: 16, paddingTop: 50 },
  text: { fontSize: 20 },
});
