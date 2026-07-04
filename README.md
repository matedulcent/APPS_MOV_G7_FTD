# APPS_MOV_G7_FTD

Frontend de la app de administración de heladerías (pedidos + stock por sucursal). Expo (React Native) + expo-router + Redux Toolkit.

Necesita el backend corriendo: [`APPS_MOV_G7_FTD_BACK`](../APPS_MOV_G7_FTD_BACK).

## Requisitos

- Node.js 22+ y npm
- El backend (`APPS_MOV_G7_FTD_BACK`) instalado y corriendo en el puerto 3001
- Para probar en celular/emulador: estar en la misma red Wi-Fi que la PC donde corre el backend

## Instalación

```bash
npm install
```

## Configurar la IP del backend

El archivo [`app/services/apiConfig.ts`](app/services/apiConfig.ts) tiene una constante `LOCAL_IP` hardcodeada que apunta a la IP de la PC donde corre el backend (no hay descubrimiento automático). **Antes de correr la app**, revisá que esa IP sea la de tu máquina en la red local:

```bash
# Windows
ipconfig
# buscar "Dirección IPv4" de tu adaptador Wi-Fi/Ethernet
```

y actualizá la línea correspondiente en `apiConfig.ts`:

```ts
const LOCAL_IP = "TU_IP_AQUI";
```

Si vas a correr solo con `--web` en la misma PC, `localhost` también funciona, pero para emulador Android o celular físico hace falta la IP de LAN.

## Correr la app

Con el backend ya levantado (`npm run dev` en `APPS_MOV_G7_FTD_BACK`):

```bash
npx expo start
```

Desde ahí podés elegir:

```bash
npx expo start --web       # navegador
npx expo start --android   # emulador/dispositivo Android
npx expo start --ios       # simulador iOS (solo macOS)
```

## Estructura

- `app/screens/` — pantallas (login, registro, selección de sucursal, categorías, pedidos, panel de proveedor/sucursal)
- `app/services/api.ts` — llamadas HTTP al backend
- `app/services/apiConfig.ts` — configuración de IP/puerto del backend
- `app/services/storage.ts` — persistencia local (AsyncStorage / localStorage en web)
- `redux/` — store, slices, thunks y reducers de Redux

## Problemas comunes

- **"Network request failed" / no carga nada**: revisar `LOCAL_IP` en `apiConfig.ts` y que el backend esté corriendo (`curl http://<IP>:3001/api/health`).
- **Warning de expo-router sobre `app/services/api.ts` o `storage.ts`** ("missing the required default export"): es un warning cosmético del bundler porque esos archivos viven dentro de `app/` (expo-router los interpreta como rutas). No afecta el funcionamiento.
- **`expo-doctor` se queja de versiones**: correr `npx expo install --fix` para realinear los paquetes con el SDK instalado.
