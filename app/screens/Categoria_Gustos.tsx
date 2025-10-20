import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    ImageBackground,
    Platform,
    StyleSheet,
    Text,
    View
} from "react-native";
import Dropdown from "../../components/Dropdown";
import PedidoCardBottom from "../../components/PedidoCardBottom";
import ScreenHeader from "../../components/ScreenHeader";
import SearchBar from "../../components/SearchBar";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 360;

type Sabor = { id: string; tipoSabor: string };

const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3001" : "http://localhost:3001";

/* ===== helpers de clasificación ===== */

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type Grupo = "Frutales" | "Cremas" | "Chocolates" | "Dulce de leche" | "Otros";

/** decide el grupo para un nombre de sabor */
function grupoDeSabor(nombre: string): Grupo {
  const n = normalize(nombre);

  // Chocolates
  if (/(chocolate|choco|cacao|amargo|blanco)/.test(n)) return "Chocolates";

  // Dulce de leche
  if (/(dulce de leche|ddl)/.test(n)) return "Dulce de leche";

  // Frutales
  if (
    /(frutilla|fresa|limon|naranja|frambuesa|mora|maracuya|maracuy|anan|piña|mango|durazno|melocoton|kiwi|uva|manzana|pera|cereza|sandia|melon|banana|platano)/.test(
      n
    )
  ) {
    return "Frutales";
  }

  // Cremas
  if (/(crema|americana|vainilla|tramontana|sambayon|flan|yogur|yogurt|ricota|panna)/.test(n)) {
    return "Cremas";
  }

  return "Otros";
}

/** etiqueta visible (tal cual) */
const labelOf = (s: Sabor) => s.tipoSabor;

/* ==================================== */

export default function Categoria_Gustos() {
  const { pedido, sucursalId, userId } = useLocalSearchParams<{
    pedido: string;
    sucursalId: string;
    userId: string;
  }>();
  const router = useRouter();

  // viene de la pantalla de envases: { "Kilo 1 (#1)": 4, ... }
  const envasesYMax: Record<string, number> = pedido
    ? JSON.parse(decodeURIComponent(pedido))
    : {};

  const [sabores, setSabores] = useState<Sabor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecciones, setSelecciones] = useState<Record<string, string[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchText, setSearchText] = useState("");

  // cargar oferta de la sucursal y quedarnos solo con sabores
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BASE_URL}/api/sucursales/${sucursalId}/oferta`);
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Error al cargar oferta");
        setSabores((data?.sabores ?? []) as Sabor[]);
      } catch (e: any) {
        Alert.alert("Error", e.message ?? "No se pudo cargar los gustos ofrecidos");
      } finally {
        setLoading(false);
      }
    })();
  }, [sucursalId]);

  // agrupamos por categoría y aplicamos búsqueda
  const grupos = useMemo(() => {
    const res: Record<Grupo, (Sabor & { label: string })[]> = {
      "Frutales": [],
      "Cremas": [],
      "Chocolates": [],
      "Dulce de leche": [],
      "Otros": [],
    };
    const q = normalize(searchText);
    for (const s of sabores) {
      const label = labelOf(s);
      if (q && !normalize(label).includes(q)) continue;
      res[grupoDeSabor(label)].push({ ...s, label });
    }
    // ordenar alfabéticamente dentro de cada grupo
    (Object.keys(res) as Grupo[]).forEach((g) =>
      res[g].sort((a, b) => a.label.localeCompare(b.label))
    );
    return res;
  }, [sabores, searchText]);

  const envaseActual = Object.keys(envasesYMax)[currentIndex] ?? "";
  const maxSabores = envasesYMax[envaseActual] ?? 0;
  const seleccionadosActual = selecciones[envaseActual] ?? [];

  const toggleSeleccion = (nombreGusto: string) => {
    setSelecciones((prev) => {
      const list = prev[envaseActual] ?? [];
      const existe = list.includes(nombreGusto);
      let nueva = existe ? list.filter((x) => x !== nombreGusto) : [...list, nombreGusto];
      if (nueva.length > maxSabores) nueva = nueva.slice(0, maxSabores); // tope por envase
      return { ...prev, [envaseActual]: nueva };
    });
  };

  const handleConfirm = () => {
    const keys = Object.keys(envasesYMax);
    if (currentIndex < keys.length - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    // fin → vamos al detalle
    const pedidoString = encodeURIComponent(JSON.stringify(selecciones));
    router.push({
      pathname: "/screens/Detalle_Pedido",
      params: { pedido: pedidoString, sucursalId: String(sucursalId), userId: String(userId) },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={{ marginTop: 10 }}>Cargando gustos...</Text>
      </View>
    );
  }

  const ordenGrupos: Grupo[] = [
    "Frutales",
    "Cremas",
    "Chocolates",
    "Dulce de leche",
    "Otros",
  ];
  const dataGrupos = ordenGrupos.filter((g) => grupos[g].length > 0);

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo2.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScreenHeader title="Gustos disponibles" />
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar gusto..."
        />

        <FlatList
          data={dataGrupos}
          keyExtractor={(g) => g}
          contentContainerStyle={{ paddingBottom: height * 0.15 }}
          renderItem={({ item: grupo }) => {
            const items = grupos[grupo];
            const opciones = items.map((x) => x.label);
            const selectedEnGrupo = seleccionadosActual.filter((s) =>
              opciones.includes(s)
            );

            return (
              <View style={{ marginBottom: 12 }}>
                <Dropdown
                  label={grupo}
                  options={opciones}
                  selected={selectedEnGrupo}
                  onSelect={(label: string) => toggleSeleccion(label)}
                  icon={
                    grupo === "Frutales"
                      ? "local-florist"
                      : grupo === "Chocolates"
                      ? "cookie"
                      : grupo === "Dulce de leche"
                      ? "favorite"
                      : "icecream"
                  }
                />
              </View>
            );
          }}
        />

        <PedidoCardBottom
          selecciones={selecciones}
          visible={true}
          onConfirm={handleConfirm}
          currentIndex={currentIndex}
          totalVolumenes={Object.keys(envasesYMax).length}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, padding: 20, backgroundColor: "rgba(255,255,255,0.6)" },
});
