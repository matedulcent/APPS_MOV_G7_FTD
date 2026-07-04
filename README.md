# APPS_MOV_G7_FTD

Frontend de la app de administración de heladerías (pedidos + stock por sucursal). Expo (React Native) + expo-router + Redux Toolkit.

Necesita el backend corriendo: [`APPS_MOV_G7_FTD_BACK`](../APPS_MOV_G7_FTD_BACK).

## Correr todo de punta a punta (back + front + Expo Go)

Guía completa para levantar el proyecto entero desde cero, incluyendo probarlo en el celular.

### 1. Backend

```bash
cd APPS_MOV_G7_FTD_BACK
npm install
```

Crear el archivo `.env` en esa carpeta (no se versiona) con:

```
DATABASE_URL="file:./dev.db"
```

Generar el cliente de Prisma y levantar el servidor:

```bash
npx prisma generate
npm run dev
```

Queda escuchando en `http://localhost:3001`. Probar con `curl http://localhost:3001/api/health` (debería devolver `{"ok":true,...}`). Más detalle en el [README del backend](../APPS_MOV_G7_FTD_BACK/README.md).

### 2. Configurar la IP para el front

Con el backend corriendo en tu PC, el celular necesita saber a qué IP de la red local conectarse (ver sección [Configurar la IP del backend](#configurar-la-ip-del-backend) más abajo). Este paso es el que más rompe cuando cambiás de red o de PC — revisalo siempre primero si algo no conecta.

### 3. Frontend

En otra terminal:

```bash
cd APPS_MOV_G7_FTD
npm install
npx expo start
```

Esto levanta Metro (el bundler) en `http://localhost:8081` y muestra un QR en la terminal.

### 4. Abrir la app en el celular con Expo Go

1. Instalá **Expo Go** desde Play Store (Android) o App Store (iOS).
2. Conectá el celular a la **misma red Wi-Fi** que la PC donde corren el backend y `expo start`.
3. Escaneá el QR que aparece en la terminal:
   - Android: desde la propia app Expo Go (botón "Scan QR code").
   - iOS: desde la cámara nativa del sistema (te va a ofrecer abrirlo en Expo Go).
4. Si el celular no puede resolver la IP (redes distintas, firewall bloqueando el puerto 8081 o 3001), usar en su lugar:
   ```bash
   npx expo start --tunnel
   ```
   Es más lento pero no depende de estar en la misma red.

### Otras formas de correr el front

```bash
npx expo start --web       # navegador, usa localhost, no requiere el paso de la IP
npx expo start --android   # emulador/dispositivo Android por USB
npx expo start --ios       # simulador iOS (solo macOS)
```

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

## Ver los datos de la base a medida que probás

El backend usa SQLite vía Prisma. Para ver/editar las tablas en vivo mientras usás la app (útil para diagnosticar qué se está guardando), corré en la carpeta del backend:

```bash
npx prisma studio
```

Abre `http://localhost:5555` con una grilla editable por tabla (Usuario, Sucursal, Orden, Envase, Sabor, ContenidoPedido).

## Estructura

- `app/screens/` — pantallas (login, registro, selección de sucursal, categorías, pedidos, panel de proveedor/sucursal)
- `app/services/apiConfig.ts` — configuración de IP/puerto del backend
- `redux/` — store, slices, thunks y reducers de Redux

## Sesión

La sesión de usuario/vendedor vive solo en memoria (Redux), a propósito: se mantiene mientras navegás dentro de la app (incluso volviendo al menú principal), pero **no sobrevive a cerrar la app** — al reabrirla, siempre arranca deslogueado. No hay persistencia en disco.

## Problemas comunes

- **"Network request failed" / no carga nada**: revisar `LOCAL_IP` en `apiConfig.ts` y que el backend esté corriendo (`curl http://<IP>:3001/api/health`).
- **El celular no puede escanear/conectar al QR**: confirmar que esté en la misma Wi-Fi que la PC, o usar `npx expo start --tunnel`.
- **Warning de expo-router sobre `app/services/apiConfig.ts`** ("missing the required default export"): es un warning cosmético del bundler porque el archivo vive dentro de `app/` (expo-router lo interpreta como ruta). No afecta el funcionamiento.
- **`expo-doctor` se queja de versiones**: correr `npx expo install --fix` para realinear los paquetes con el SDK instalado.





Terminal 1 — Backend

cd C:\Users\Usuario\Documents\Apps\APPS_MOV_G7_FTD_BACK
npm run dev
Dejala abierta corriendo. Deberías ver 🚀 Servidor corriendo en http://localhost:3001.

(Si es la primera vez o borraste node_modules, antes corré npm install y npx prisma generate. El .env con DATABASE_URL="file:./dev.db" ya lo tenés creado de la sesión anterior.)

Terminal 2 — Frontend

cd C:\Users\Usuario\Documents\Apps\APPS_MOV_G7_FTD
npx expo start
Va a mostrar un QR en la terminal.

En el celular
Abrí Expo Go.
Asegurate de estar en la misma Wi-Fi que esta PC.
Escaneá el QR (Android: desde la app Expo Go; iOS: desde la cámara nativa).
Si no conecta (redes distintas, firewall), en la Terminal 2 hacé Ctrl+C y corré npx expo start --tunnel en su lugar.

Opcional — ver la base de datos en vivo
Una tercera terminal:


cd C:\Users\Usuario\Documents\Apps\APPS_MOV_G7_FTD_BACK
npx prisma studio
Abre http://localhost:5555 en el navegador.