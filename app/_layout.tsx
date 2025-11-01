import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Provider } from "react-redux";
import { store } from "../store/store"; // <-- tu store

export default function Layout() {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        {/* Resto de la navegación */}
        <Stack screenOptions={{ headerShown: false }} />

        {/* PedidoCard siempre visible abajo */}
        {/* <PedidoCard /> */}
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
