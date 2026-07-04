import { useFocusEffect, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ActionButton from "../../components/ActionButton";
import Dropdown from "../../components/Dropdown";
import ScreenHeader from "../../components/ScreenHeader";
import { BORDER, CARD_BG, INK, MUTED, PINK } from "../../constants/brand";
import {
  syncEnvasesDisponibles,
  toggleEnvase,
  updateCantidad,
} from "../../redux/slices/pedidoSlice";
import type { AppDispatch, RootState } from "../../redux/store";
import { BASE_URL } from "../services/apiConfig";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;

type Envase = { id: string; tipoEnvase: string; maxCantSabores: number; categoria: string };

function labelForEnvase(e?: Envase): string {
  if (!e) return "Envase desconocido";
  const [kindRaw, restRaw] = e.tipoEnvase.split("_");
  const kind = (kindRaw ?? "").toLowerCase();
  const rest = restRaw ?? "";

  if (kind === "kilo") {
    if (rest === "1") return "1 kg";
    if (rest === "0.5") return "1/2 kg";
    if (rest === "0.25") return "1/4 kg";
    return `${rest} kg`;
  }
  if (kind === "cucurucho") return `Cucurucho ${rest}`;
  if (kind === "vaso") return `Vaso ${rest}`;
  return e.tipoEnvase.replace("_", " ");
}

/** Ícono por sección; las secciones nuevas creadas por el vendedor caen en el genérico. */
function iconForGrupo(nombre: string): React.ComponentProps<typeof Dropdown>["icon"] {
  const n = nombre.toLowerCase();
  if (n === "kilo") return "scale";
  if (n === "vasos") return "local-drink";
  return "icecream";
}

export default function Categoria_Envase() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();
  const sucursalId = useSelector((state: RootState) => state.user.sucursalId);
  const selecciones = useSelector((state: RootState) => state.pedido.envases);

  const [loading, setLoading] = useState(true);
  const [envasesOfrecidos, setEnvasesOfrecidos] = useState<Envase[]>([]);

  // 🔹 Cargar envases desde API cada vez que la pantalla se enfoque
  useFocusEffect(
    React.useCallback(() => {
      if (!sucursalId) return;
      let isActive = true;
      setLoading(true);

      (async () => {
        try {
          const r = await fetch(`${BASE_URL}/api/sucursales/${sucursalId}/oferta`);
          const data = await r.json();
          if (!r.ok) throw new Error(data?.error || "Error al cargar oferta");

          const envases = data?.envases ?? [];
          if (isActive) {
            setEnvasesOfrecidos(envases);
            dispatch(syncEnvasesDisponibles(envases.map((e: Envase) => e.tipoEnvase)));
          }
        } catch (e: any) {
          if (isActive)
            Alert.alert("Error", e.message ?? "No se pudo cargar la oferta de envases.");
        } finally {
          if (isActive) setLoading(false);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [sucursalId])
  );

  // Agrupar dinámicamente por la sección real del envase (ya no se adivina por el nombre)
  const grupos = useMemo(() => {
    const g: Record<string, (Envase & { display: string })[]> = {};
    for (const e of envasesOfrecidos) {
      const grupo = e.categoria || "Especiales";
      if (!g[grupo]) g[grupo] = [];
      g[grupo].push({ ...e, display: labelForEnvase(e) });
    }
    Object.keys(g).forEach(k => g[k].sort((a, b) => a.display.localeCompare(b.display)));
    return g;
  }, [envasesOfrecidos]);

  const handleToggle = (tipoEnvase: string) => dispatch(toggleEnvase(tipoEnvase));
  const handleCantidad = (tipoEnvase: string, delta: number) =>
    dispatch(updateCantidad({ opcion: tipoEnvase, delta }));

  const handleConfirm = () => {
    if (selecciones.length === 0) {
      Alert.alert("Atención", "Debes seleccionar al menos un envase.");
      return;
    }

    const envasesValidos = selecciones.filter(sel =>
      envasesOfrecidos.some(e => e.tipoEnvase === sel.opcion)
    );

    if (envasesValidos.length === 0) {
      Alert.alert("Atención", "El envase seleccionado ya no existe.");
      return;
    }

    // La key incluye el tipoEnvase real (antes de "|") para poder resolver el
    // envase correcto al confirmar el pedido, sin importar cómo se formatee
    // el label lindo que ve el usuario (antes se perdía esa info y los
    // envases especiales terminaban guardándose como "Cucurucho_1" por un
    // fallback hardcodeado).
    const pedidoFinal: Record<string, number> = {};
    for (const { opcion, cantidad } of envasesValidos) {
      const env = envasesOfrecidos.find(e => e.tipoEnvase === opcion);
      const max = env?.maxCantSabores ?? 1;
      for (let i = 1; i <= cantidad; i++)
        pedidoFinal[`${opcion}|${labelForEnvase(env)} (#${i})`] = max;
    }

    router.push({
      pathname: "/screens/Categoria_Gustos",
      params: { pedido: encodeURIComponent(JSON.stringify(pedidoFinal)) },
    });
  };

  if (!sucursalId)
    return (
      <View style={styles.centered}>
        <Text style={{ color: MUTED }}>Selecciona una sucursal primero...</Text>
      </View>
    );

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PINK} />
        <Text style={{ marginTop: 10, color: MUTED }}>Cargando envases...</Text>
      </View>
    );

  if (envasesOfrecidos.length === 0)
    return (
      <View style={styles.centered}>
        <Text style={{ color: MUTED }}>No hay envases disponibles en esta sucursal.</Text>
        <View style={{ marginTop: 20, width: "60%" }}>
          <ActionButton label="Volver atrás" icon="arrow-back" onPress={() => router.back()} />
        </View>
      </View>
    );

  const dataGrupos = Object.keys(grupos).sort();

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo1.jpg")}
      style={styles.backgroundImage}
      resizeMode={isSmallScreen ? "stretch" : "cover"}
    >
      <View style={styles.overlay}>
        <ScreenHeader title="Seleccionar envase" />

        <FlatList
          data={dataGrupos}
          keyExtractor={g => g}
          contentContainerStyle={{ paddingBottom: height * 0.16 }}
          renderItem={({ item: grupo }) => {
            const envs = grupos[grupo];
            const opciones = envs.map(e => e.display);
            const seleccionadosDisplay = selecciones
              .filter(s => envs.some(e => e.tipoEnvase === s.opcion))
              .map(s => envs.find(e => e.tipoEnvase === s.opcion)?.display ?? "");

            return (
              <View style={{ marginBottom: 12 }}>
                <Dropdown
                  label={grupo}
                  options={opciones}
                  selected={seleccionadosDisplay}
                  onSelect={displayValue => {
                    const env = envs.find(e => e.display === displayValue);
                    if (env) handleToggle(env.tipoEnvase);
                  }}
                  icon={iconForGrupo(grupo)}
                />

                {selecciones
                  .filter(s => envs.some(e => e.tipoEnvase === s.opcion))
                  .map(({ opcion, cantidad }) => {
                    const env = envs.find(e => e.tipoEnvase === opcion);
                    if (!env) return null;
                    return (
                      <View key={opcion} style={styles.itemRow}>
                        <Text style={styles.itemText}>{env.display}</Text>
                        <View style={styles.counter}>
                          <Pressable
                            style={({ pressed }) => [styles.counterButton, pressed && { opacity: 0.7 }]}
                            onPress={() => handleCantidad(opcion, -1)}
                          >
                            <Text style={styles.counterText}>-</Text>
                          </Pressable>
                          <Text style={styles.counterValue}>{cantidad}</Text>
                          <Pressable
                            style={({ pressed }) => [styles.counterButton, pressed && { opacity: 0.7 }]}
                            onPress={() => handleCantidad(opcion, 1)}
                          >
                            <Text style={styles.counterText}>+</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
              </View>
            );
          }}
        />

        <View style={[styles.footer, { bottom: insets.bottom + 16 }]}>
          <ActionButton label="Siguiente" icon="arrow-forward" onPress={handleConfirm} />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  overlay: {
    flex: 1,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: CARD_BG,
  },
  itemText: { fontSize: width * 0.042, color: INK, fontWeight: "600" },
  counter: { flexDirection: "row", alignItems: "center" },
  counterButton: {
    backgroundColor: "#fdeaf1",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  counterText: { fontSize: 18, fontWeight: "bold", color: PINK },
  counterValue: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 30,
    textAlign: "center",
    color: INK,
  },
  footer: { position: "absolute", left: 20, right: 20 },
});
