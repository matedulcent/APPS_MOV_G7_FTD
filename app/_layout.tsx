// app/_layout.tsx
import { Slot } from "expo-router";
import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import store from "../redux/store";
import { storage } from "./services/storage"; // web => localStorage, native => AsyncStorage

function Hydrator() {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const raw = await storage.getItem("user");
        if (raw) {
          const saved = JSON.parse(raw);
          dispatch({ type: "HYDRATE_USER", payload: saved });
        }
      } catch (e) {
        console.warn("[Hydrator] No se pudo hidratar usuario:", e);
      }
    })();
  }, [dispatch]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Hydrator />
    </Provider>
  );
}
