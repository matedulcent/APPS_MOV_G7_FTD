import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
import { StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <Image
        source={require("@/assets/images/partial-react-logo.png")}
        style={styles.logo}
      />
      <ThemedText type="title">Bienvenido 🚀</ThemedText>
      <ThemedText>
        Este es tu punto de partida en React Native con Expo.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  logo: {
    width: 200,
    height: 120,
    marginBottom: 20,
  },
});
