import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    ImageBackground,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Dropdown from "../../components/Dropdown";
import ScreenHeader from "../../components/ScreenHeader";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;
const isWeb = Platform.OS === "web";

type Envase = { id: string; tipoEnvase: string; maxCantSabores: number };
type Grupo = "Cucurucho" | "Kilo" | "Vaso" | "Otros";

const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3001" : "http://localhost:3001";

// util: formatea etiqueta visible
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

// util: mapea prefix a grupo
function grupoDe(e: Envase): Grupo {
  const k = (e.tipoEnvase.split("_")[0] || "").toLowerCase();
  if (k === "cucurucho") return "Cucurucho";
  if (k === "kilo") return "Kilo";
  if (k === "vaso") return "Vaso";
  return "Otros";
}

export default function Categoria_Envase() {
  const { sucursalId, userId } = useLocalSearchParams<{ sucursalId: string; userId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [envasesOfrecidos, setEnvasesOfrecidos] = useState<Envase[]>([]);
  // seleccionamos por tipoEnvase (clave estable)
  const [selecciones, setSelecciones] = useState<{ envases: { opcion: string; cantidad: number }[] }>({ envases: [] });

  // cargar desde backend la oferta de la sucursal
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BASE_URL}/api/sucursales/${sucursalId}/oferta`);
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Error al cargar oferta");
        const lista: Envase[] = (data?.envases ?? []) as Envase[];
        setEnvasesOfrecidos(lista);
      } catch (e: any) {
        Alert.alert("Error", e.message ?? "No se pudo cargar la oferta");
      } finally {
        setLoading(false);
      }
    })();
  }, [sucursalId]);

  // agrupamos para render (Cucurucho, Kilo, Vaso, Otros)
  const grupos = useMemo(() => {
    const g: Record<Grupo, (Envase & { display: string })[]> = {
      Cucurucho: [],
      Kilo: [],
      Vaso: [],
      Otros: [],
    };
    for (const e of envasesOfrecidos) {
      const display = labelForEnvase(e);
      g[grupoDe(e)].push({ ...e, display });
    }
    // orden simple por display
    (Object.keys(g) as Grupo[]).forEach((k) => g[k].sort((a, b) => a.display.localeCompare(b.display)));
    return g;
  }, [envasesOfrecidos]);

  const toggleSeleccion = (tipoEnvase: string) => {
    setSelecciones((prev) => {
      const lista = prev.envases ?? [];
      const existe = lista.find((i) => i.opcion === tipoEnvase);
      const nuevas = existe
        ? lista.filter((i) => i.opcion !== tipoEnvase)
        : [...lista, { opcion: tipoEnvase, cantidad: 1 }];
      return { envases: nuevas };
    });
  };

  const updateCantidad = (tipoEnvase: string, delta: number) => {
    setSelecciones((prev) => {
      const lista = prev.envases ?? [];
      const nuevas = lista.map((i) =>
        i.opcion === tipoEnvase ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i
      );
      return { envases: nuevas };
    });
  };

  const handleConfirm = () => {
    const seleccionadas = selecciones.envases ?? [];
    if (seleccionadas.length === 0) {
      Alert.alert("Atención", "Debes seleccionar al menos un envase.");
      return;
    }
    // armamos el pedido => key visible y cantidad de sabores que permite cada unidad
    const pedidoFinal: Record<string, number> = {};
    for (const { opcion, cantidad } of seleccionadas) {
      const env = envasesOfrecidos.find((e) => e.tipoEnvase === opcion);
      const max = env?.maxCantSabores ?? 1;
      for (let i = 1; i <= cantidad; i++) {
        // ejemplo: "Kilo 1 (#2)" / "Cucurucho 2 (#1)"
        pedidoFinal[`${labelForEnvase(env!)} (#${i})`] = max;
      }
    }
    const pedidoString = encodeURIComponent(JSON.stringify(pedidoFinal));
    router.push({
      pathname: "/screens/Categoria_Gustos",
      params: { pedido: pedidoString, sucursalId: String(sucursalId), userId: String(userId) },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#f4679f" />
        <Text style={{ marginTop: 10 }}>Cargando envases...</Text>
      </View>
    );
  }

  const ordenGrupos: Grupo[] = ["Cucurucho", "Kilo", "Vaso", "Otros"];
  const dataGrupos = ordenGrupos.filter((g) => grupos[g].length > 0);

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
          keyExtractor={(g) => g}
          contentContainerStyle={{ paddingBottom: height * 0.15 }}
          renderItem={({ item: grupo }) => {
            const envs = grupos[grupo];
            // opciones visibles del grupo
            const opciones = envs.map((e) => e.display);
            // seleccionados del grupo (por display)
            const seleccionadosDisplay = (selecciones.envases ?? [])
              .filter((s) => envs.some((e) => e.tipoEnvase === s.opcion))
              .map((s) => envs.find((e) => e.tipoEnvase === s.opcion)!.display);

            return (
              <View style={{ marginBottom: height * 0.03 }}>
                <Dropdown
                  label={grupo}
                  options={opciones}
                  selected={seleccionadosDisplay}
                  // onSelect recibe el label; lo mapeamos a tipoEnvase
                  onSelect={(displayValue: string) => {
                    const env = envs.find((e) => e.display === displayValue);
                    if (env) toggleSeleccion(env.tipoEnvase);
                  }}
                  icon={grupo === "Kilo" ? "scale" : grupo === "Vaso" ? "local-drink" : "icecream"}
                />

                {(selecciones.envases ?? [])
                  .filter((s) => envs.some((e) => e.tipoEnvase === s.opcion))
                  .map(({ opcion, cantidad }) => {
                    const env = envs.find((e) => e.tipoEnvase === opcion)!;
                    return (
                      <View key={opcion} style={styles.itemRow}>
                        <Text style={styles.itemText}>{env.display}</Text>
                        <View style={styles.counter}>
                          <Pressable
                            style={styles.counterButton}
                            onPress={() => updateCantidad(opcion, -1)}
                          >
                            <Text style={styles.counterText}>-</Text>
                          </Pressable>
                          <Text style={styles.counterValue}>{cantidad}</Text>
                          <Pressable
                            style={styles.counterButton}
                            onPress={() => updateCantidad(opcion, 1)}
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

        <View style={[styles.footer, { bottom: height * 0.13 }]}>
          <Pressable style={[styles.button, { backgroundColor: "#f4679fff" }]} onPress={handleConfirm}>
            <Text style={[styles.buttonText, { fontSize: isWeb ? 16 : width * 0.045 }]}>Siguiente</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%", resizeMode: "cover" },
  overlay: { flex: 1, padding: isWeb ? 40 : width * 0.05, backgroundColor: "rgba(255,255,255,0.6)" },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: height * 0.008,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  itemText: { fontSize: isWeb ? 16 : width * 0.045 },
  counter: { flexDirection: "row", alignItems: "center" },
  counterButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  counterText: { fontSize: 18, fontWeight: "bold" },
  counterValue: { fontSize: 16, fontWeight: "bold", minWidth: 30, textAlign: "center" },
  footer: { position: "absolute", left: isWeb ? 40 : width * 0.05, right: isWeb ? 40 : width * 0.05 },
  button: { backgroundColor: "#6200ee", paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
