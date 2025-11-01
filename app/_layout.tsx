// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { Provider } from "react-redux";
import { store } from "../redux/store"; // <- agregar las llaves

export default function Layout() {
  return (
    <Provider store={store}>
      <Stack
        screenOptions={{
          headerShown: false, // <-- oculta el banner en todas las pantallas
        }}
      />
    </Provider>
  );
}
