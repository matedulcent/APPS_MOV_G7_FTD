import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "../../components/Dropdown";
import PedidoCardBottom from "../../components/PedidoCardBottom";
import ScreenHeader from "../../components/ScreenHeader";
import SearchBar from "../../components/SearchBar";

const { width, height } = Dimensions.get("window");

type Sabor = { id: string; tipoSabor: string };
type Grupo = "Frutales" | "Cremas" | "Chocolates" | "Dulce de leche" | "Otros";

// ===== helpers =====
function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function grupoDeSabor(nombre: string): Grupo {
  const n = normalize(nombre);
  if (/(chocolate|choco|cacao|amargo|blanco)/.test(n)) return "Chocolates";
  if (/(dulce de leche|ddl)/.test(n)) return "Dulce de leche";
  if (/(frutilla|fresa|limon|naranja|frambuesa|mora|maracuya|anan|piña|mango|durazno|kiwi|uva|manzana|pera|cereza|sandia|melon|banana|platano)/.test(n)) return "Frutales";
  if (/(crema|americana|vainilla|tramontana|sambayon|flan|yogur|yogurt|ricota|panna)/.test(n)) return "Cremas";
  return "Otros";
}

const labelOf = (s: Sabor) => s.tipoSabor;

// =====================================

export default function Categoria_Gustos() {
  const dispatch = useDispatch();
  const router = useRouter();

  // redux clásico
  const sabores = useSelector((state: any) => state.sabores.items) as Sabor[];
  const loading = useSelector((state: any) => state.sabores.loading);
  const sucursalId = useSelector((state: any) => state.user.user.sucursalId);
  const pedidoRedux = useSelector((state: any) => state.pedido.envasesYMax);

  const [selecciones, setSelecciones] = useState<Record<string, string[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchText, setSearchText] = useState("");

  // cargar sabores desde acción clásica
  useEffect(() => {
    if (sucursalId) dispatch(fetchSaboresAction(sucursalId));
  }, [sucursalId]);

  // agrupar sabores según búsqueda
  const grupos = useMemo(() => {
    const res: Record<Grupo, (Sabor & { label: string })[]> = {
      Frutales: [],
      Cremas: [],
      Chocolates: [],
      "Dulce de leche": [],
      Otros: [],
    };
    const q = normalize(searchText);
    for (const s of sabores) {
      const label = labelOf(s);
      if (q && !normalize(label).includes(q)) continue;
      res[grupoDeSabor(label)].push({ ...s, label });
    }
    (Object.keys(res) as Grupo[]).forEach((g) =>
      res[g].sort((a, b) => a.label.localeCompare(b.label))
    );
    return res;
  }, [sabores, searchText]);

  const envaseActual = Object.keys(pedidoRedux)[currentIndex] ?? "";
  const maxSabores = pedidoRedux[envaseActual] ?? 0;
  const seleccionadosActual = selecciones[envaseActual] ?? [];

  const toggleSeleccion = (nombreGusto: string) => {
    setSelecciones((prev) => {
      const list = prev[envaseActual] ?? [];
      const existe = list.includes(nombreGusto);
      let nueva = existe ? list.filter((x) => x !== nombreGusto) : [...list, nombreGusto];
      if (nueva.length > maxSabores) nueva = nueva.slice(0, maxSabores);
      return { ...prev, [envaseActual]: nueva };
    });
  };

  const handleConfirm = () => {
    const keys = Object.keys(pedidoRedux);
    if (currentIndex < keys.length - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    router.push({
      pathname: "/screens/Detalle_Pedido",
      params: { pedido: encodeURIComponent(JSON.stringify(selecciones)) },
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

  const ordenGrupos: Grupo[] = ["Frutales", "Cremas", "Chocolates", "Dulce de leche", "Otros"];
  const dataGrupos = ordenGrupos.filter((g) => grupos[g].length > 0);

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo2.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScreenHeader title="Gustos disponibles" />

        <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Buscar gusto..." />

        <FlatList
          data={dataGrupos}
          keyExtractor={(g) => g}
          contentContainerStyle={{ paddingBottom: height * 0.15 }}
          renderItem={({ item: grupo }) => {
            const items = grupos[grupo];
            const opciones = items.map((x) => x.label);
            const selectedEnGrupo = seleccionadosActual.filter((s) => opciones.includes(s));

            return (
              <View style={{ marginBottom: 12 }}>
                <Dropdown
                  label={grupo}
                  options={opciones}
                  selected={selectedEnGrupo}
                  onSelect={toggleSeleccion}
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
          totalVolumenes={Object.keys(pedidoRedux).length}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, padding: 20, backgroundColor: "rgba(255,255,255,0.6)" },
});
