import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
import Dropdown from "../../components/Dropdown";
import ScreenHeader from "../../components/ScreenHeader";
import { toggleEnvase, updateCantidad } from "../../redux/slices/pedidoSlice";
import type { AppDispatch, RootState } from "../../redux/store";
import { BASE_URL } from "../services/apiConfig";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;

type Envase = { id: string; tipoEnvase: string; maxCantSabores: number };
type Grupo = "Cucurucho" | "Kilo" | "Vaso" | "Otros";

function labelForEnvase(e: Envase): string {
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

function grupoDe(e: Envase): Grupo {
  const k = (e.tipoEnvase.split("_")[0] || "").toLowerCase();
  if (k === "cucurucho") return "Cucurucho";
  if (k === "kilo") return "Kilo";
  if (k === "vaso") return "Vaso";
  return "Otros";
}

export default function Categoria_Envase() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const sucursalId = useSelector((state: RootState) => state.user.sucursalId);
  const selecciones = useSelector((state: RootState) => state.pedido.envases);

  const [loading, setLoading] = useState(true);
  const [envasesOfrecidos, setEnvasesOfrecidos] = useState<Envase[]>([]);

  useEffect(() => {
    if (!sucursalId) return;

    setLoading(true);
    (async () => {
      try {
        const r = await fetch(`${BASE_URL}/api/sucursales/${sucursalId}/oferta`);
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Error al cargar oferta");
        setEnvasesOfrecidos(data?.envases ?? []);
      } catch (e: any) {
        Alert.alert("Error", e.message ?? "No se pudo cargar la oferta");
      } finally {
        setLoading(false);
      }
    })();
  }, [sucursalId]);

  const grupos = useMemo(() => {
    const g: Record<Grupo, (Envase & { display: string })[]> = { Cucurucho: [], Kilo: [], Vaso: [], Otros: [] };
    for (const e of envasesOfrecidos) g[grupoDe(e)].push({ ...e, display: labelForEnvase(e) });
    (Object.keys(g) as Grupo[]).forEach(k => g[k].sort((a, b) => a.display.localeCompare(b.display)));
    return g;
  }, [envasesOfrecidos]);

  const handleToggle = (tipoEnvase: string) => dispatch(toggleEnvase(tipoEnvase));
  const handleCantidad = (tipoEnvase: string, delta: number) => dispatch(updateCantidad({ opcion: tipoEnvase, delta }));

  const handleConfirm = () => {
    if (selecciones.length === 0) {
      Alert.alert("Atención", "Debes seleccionar al menos un envase.");
      return;
    }

    const pedidoFinal: Record<string, number> = {};
    for (const { opcion, cantidad } of selecciones) {
      const env = envasesOfrecidos.find(e => e.tipoEnvase === opcion);
      const max = env?.maxCantSabores ?? 1;
      for (let i = 1; i <= cantidad; i++) pedidoFinal[`${labelForEnvase(env!)} (#${i})`] = max;
    }

    router.push({
      pathname: "/screens/Categoria_Gustos",
      params: { pedido: encodeURIComponent(JSON.stringify(pedidoFinal)) },
    });
  };

  if (!sucursalId)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Selecciona una sucursal primero...</Text>
      </View>
    );

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#f4679f" />
        <Text style={{ marginTop: 10 }}>Cargando envases...</Text>
      </View>
    );

  const ordenGrupos: Grupo[] = ["Cucurucho", "Kilo", "Vaso", "Otros"];
  const dataGrupos = ordenGrupos.filter(g => grupos[g].length > 0);

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo1.jpg")}
      style={styles.backgroundImage}
      resizeMode={isSmallScreen ? "stretch" : "cover"}
    >
      <View style={styles.overlay}>
        <ScreenHeader title="Seleccionar Envase" />

        <FlatList
          data={dataGrupos}
          keyExtractor={g => g}
          contentContainerStyle={{ paddingBottom: height * 0.15 }}
          renderItem={({ item: grupo }) => {
            const envs = grupos[grupo];
            const opciones = envs.map(e => e.display);
            const seleccionadosDisplay = selecciones
              .filter(s => envs.some(e => e.tipoEnvase === s.opcion))
              .map(s => envs.find(e => e.tipoEnvase === s.opcion)!.display);

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
                  icon={grupo === "Kilo" ? "scale" : grupo === "Vaso" ? "local-drink" : "icecream"}
                />

                {selecciones
                  .filter(s => envs.some(e => e.tipoEnvase === s.opcion))
                  .map(({ opcion, cantidad }) => {
                    const env = envs.find(e => e.tipoEnvase === opcion)!;
                    return (
                      <View key={opcion} style={styles.itemRow}>
                        <Text style={styles.itemText}>{env.display}</Text>
                        <View style={styles.counter}>
                          <Pressable style={styles.counterButton} onPress={() => handleCantidad(opcion, -1)}>
                            <Text style={styles.counterText}>-</Text>
                          </Pressable>
                          <Text style={styles.counterValue}>{cantidad}</Text>
                          <Pressable style={styles.counterButton} onPress={() => handleCantidad(opcion, 1)}>
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

        <View style={[styles.footer, { bottom: height * 0.13 }]}>
          <Pressable style={[styles.button, { backgroundColor: "#f4679fff" }]} onPress={handleConfirm}>
            <Text style={[styles.buttonText, { fontSize: width * 0.045 }]}>Siguiente</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, padding: 20, backgroundColor: "rgba(255,255,255,0.6)" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, padding: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, backgroundColor: "#fff" },
  itemText: { fontSize: width * 0.045 },
  counter: { flexDirection: "row", alignItems: "center" },
  counterButton: { backgroundColor: "#eee", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, marginHorizontal: 5 },
  counterText: { fontSize: 18, fontWeight: "bold" },
  counterValue: { fontSize: 16, fontWeight: "bold", minWidth: 30, textAlign: "center" },
  footer: { position: "absolute", left: 20, right: 20 },
  button: { backgroundColor: "#6200ee", paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
