// app/index.tsx
import NavButton from "@/components/NavButton";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  // Definimos la ruta correcta para Expo Router
  const nextRoute = "./screens/categoria_gustos"; // solo ruta relativa en minúsculas

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        <NavButton
          text="Siguiente"
          route={`/${nextRoute}`} // ya está en el formato correcto
          style={{ margin: 10 }}
        />
      </View>
      <Text style={styles.text}>🏠 Esta es la pantalla Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-start", padding: 16, paddingTop: 50 },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
  },
});
