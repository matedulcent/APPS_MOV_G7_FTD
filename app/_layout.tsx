// app/_layout.tsx
import { Slot } from "expo-router";
import React from "react";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import store from "../redux/store";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <Slot />
      </Provider>
    </SafeAreaProvider>
  );
}
