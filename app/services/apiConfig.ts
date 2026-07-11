// src/config/apiConfig.ts
import { Platform } from "react-native";

// IP de la PC donde corre el backend. Se define en el archivo .env
// (no versionado) como EXPO_PUBLIC_LOCAL_IP. Ver .env.example y el README.
const LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_IP;

if (!LOCAL_IP) {
    throw new Error(
        "Falta EXPO_PUBLIC_LOCAL_IP. Creá un archivo .env en la raíz del proyecto " +
            "(podés copiar .env.example) con la IP de tu PC en la red local."
    );
}

const PORT = 3001;

export const BASE_URL =
    Platform.OS === "android"
        ? `http://${LOCAL_IP}:${PORT}`
        : `http://${LOCAL_IP}:${PORT}`;

export default {
    BASE_URL,
};
