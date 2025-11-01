// app/screens/Categoria_Gustos.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Dropdown from "../../components/Dropdown";
import PedidoCardBottom from "../../components/PedidoCardBottom";
import ScreenHeader from "../../components/ScreenHeader";
import { fetchSabores } from "../../redux/actions/saboresActions";
import { toggleEnvase } from "../../redux/slices/pedidoSlice";
import type { AppDispatch, RootState } from "../../redux/store";

const { height } = Dimensions.get("window");

type Sabor = { id: string; tipoSabor: string };
type Grupo = "Frutales" | "Cremas" | "Chocolates" | "Dulce de leche" | "Otros";

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const grupoDeSabor = (nombre: string): Grupo => {
  const n = normalize(nombre);
  if (/(chocolate|choco|cacao|amargo|blanco)/.test(n)) return "Chocolates";
  if (/(dulce de leche|ddl)/.test(n)) return "Dulce de leche";
  if (
    /(frutilla|fresa|limon|naranja|frambuesa|mora|maracuya|anan|piña|mango|durazno|kiwi|uva|manzana|pera|cereza|sandia|melon|banana|platano)/.test(
      n
    )
  )
    return "Frutales";
  if (/(crema|americana|vainilla|tramontana|sambayon|flan|yogur|yogurt|ricota|panna)/.test(n))
    return "Cremas";
  return "Otros";
};

const labelOf = (s: Sabor) => s.tipoSabor;

const SearchBarUX = ({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.searchContainer,
        { borderColor: focused ? "#fd5f81ff" : "#ccc" },
      ]}
    >
      <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor="#999"
      />
    </View>
  );
};

export default function Categoria_Gustos() {
  const router = useRouter();
  const { pedido } = useLocalSearchParams<{ pedido: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const sabores = useSelector((state: RootState) => state.sabores.items);
  const loading = useSelector((state: RootState) => state.sabores.loading);
  const error = useSelector((state: RootState) => state.sabores.error);
  const sucursalId = useSelector((state: RootState) => state.user.sucursalId);

  const [selecciones, setSelecciones] = useState<Record<string, string[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false); // 🔹 toggle buscador

  const pedidoParsed: Record<string, number> = useMemo(() => {
    try {
      return pedido ? JSON.parse(decodeURIComponent(pedido)) : {};
    } catch {
      Alert.alert("Error", "No se pudo leer el pedido recibido");
      return {};
    }
  }, [pedido]);

  useEffect(() => {
    if (sucursalId) dispatch(fetchSabores(sucursalId));
  }, [sucursalId]);

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
    (Object.keys(res) as Grupo[]).forEach(g =>
      res[g].sort((a, b) => a.label.localeCompare(b.label))
    );
    return res;
  }, [sabores, searchText]);

  const envases = Object.keys(pedidoParsed);
  const envaseActual = envases[currentIndex] ?? "";
  const maxSabores = pedidoParsed[envaseActual] ?? 0;
  const seleccionadosActual = selecciones[envaseActual] ?? [];

  const toggleSeleccion = (nombreGusto: string) => {
    setSelecciones(prev => {
      const list = prev[envaseActual] ?? [];
      const existe = list.includes(nombreGusto);
      let nueva = existe
        ? list.filter(x => x !== nombreGusto)
        : [...list, nombreGusto];
      if (nueva.length > maxSabores) nueva = nueva.slice(0, maxSabores);
      return { ...prev, [envaseActual]: nueva };
    });
    dispatch(toggleEnvase(nombreGusto));
  };

  const handleConfirm = () => {
    const total = envases.length;
    if (currentIndex < total - 1) {
      setCurrentIndex(i => i + 1);
      return;
    }
    router.push({
      pathname: "/screens/Detalle_Pedido",
      params: { pedido: encodeURIComponent(JSON.stringify(selecciones)) },
    });
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fd5f81ff" />
        <Text style={{ marginTop: 10 }}>Cargando gustos...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", fontSize: 16 }}>{error}</Text>
      </View>
    );

  const ordenGrupos: Grupo[] = [
    "Frutales",
    "Cremas",
    "Chocolates",
    "Dulce de leche",
    "Otros",
  ];
  const dataGrupos = ordenGrupos.filter(g => grupos[g].length > 0);

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo2.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* 🔹 Header con toggle de buscador */}
        <ScreenHeader
          title={`Gustos para ${envaseActual}`}
          showSearch={true}
          onToggleSearch={() => setShowSearch(prev => !prev)}
        />

        {/* 🔹 Buscador desplegable */}
        {showSearch && (
          <SearchBarUX
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar gusto..."
          />
        )}

        <View style={styles.selectionContainer}>
          <Text style={styles.selectionLabel}>Gustos seleccionados</Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${(seleccionadosActual.length / maxSabores) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.selectionCount}>
            {seleccionadosActual.length} / {maxSabores}
          </Text>
        </View>

        <FlatList
          data={dataGrupos}
          keyExtractor={g => g}
          contentContainerStyle={{ paddingBottom: height * 0.15 }}
          renderItem={({ item: grupo }) => {
            const items = grupos[grupo];
            const opciones = items.map(x => x.label);
            const seleccionadasGrupo = seleccionadosActual.filter(s =>
              opciones.includes(s)
            );

            return (
              <View style={{ marginBottom: 12 }}>
                <Dropdown
                  label={grupo}
                  options={opciones}
                  selected={seleccionadasGrupo}
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
          totalVolumenes={envases.length}
        />
      </View>
    </ImageBackground>
  );
}

// 🔹 Estilos permanecen iguales
const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, padding: 20, backgroundColor: "rgba(255,255,255,0.6)" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  selectionContainer: {
    marginVertical: 12,
    alignItems: "center",
  },
  selectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#444",
  },
  progressBarBackground: {
    width: "80%",
    height: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fd5f81ff",
    borderRadius: 6,
  },
  selectionCount: {
    marginTop: 4,
    fontSize: 12,
    color: "#555",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 25,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
});
