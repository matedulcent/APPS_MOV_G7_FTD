// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import { Provider } from "react-redux";
import store from "../redux/store"; // <- default import

export default function Layout() {
  return (
    <Provider store={store}>
      <Stack />
    </Provider>
  );
}
