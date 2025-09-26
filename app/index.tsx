// app/index.tsx
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Botón arriba a la derecha */}
      <View style={styles.header}>
        <Link href="/explore" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>➡ Ir a Explore</Text>
          </Pressable>
        </Link>
      </View>

      <Text style={styles.text}>🏠 Esta es la pantalla Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 16,
    paddingTop: 50, // margen superior
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#6200ee",
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  text: {
    fontSize: 20,
  },
});
