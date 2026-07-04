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
import { DANGER, INK, MUTED, PINK } from "../../constants/brand";
import { fetchSabores } from "../../redux/actions/saboresActions";
import { limpiarPedido, setSeleccion, toggleEnvase } from "../../redux/slices/pedidoSlice";
import type { AppDispatch, RootState } from "../../redux/store";

const { height } = Dimensions.get("window");

type Sabor = { id: string; tipoSabor: string; categoria: string };

const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

/** Ícono por sección; las secciones nuevas creadas por el vendedor caen en el genérico. */
const iconForGrupo = (nombre: string): React.ComponentProps<typeof Dropdown>["icon"] => {
  const n = normalize(nombre);
  if (n === "frutales") return "local-florist";
  if (n === "chocolates") return "cookie";
  if (n === "dulce de leche") return "favorite";
  return "icecream";
};

const labelOf = (s: Sabor) => s.tipoSabor;

/** Las keys de envase vienen como "tipoEnvase|Label lindo (#N)"; esto muestra solo la parte linda. */
const displayLabel = (envaseKey: string) => envaseKey.split("|")[1] ?? envaseKey;

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
    <View style={[styles.searchContainer, { borderColor: focused ? PINK : "#ddd" }]}>
      <Ionicons name="search" size={20} color="#999" style={{ marginRight: 8 }} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor="#999"
        autoCapitalize="none"
      />
    </View>
  );
};

export default function Categoria_Gustos() {
  const router = useRouter();
  const { pedido } = useLocalSearchParams<{ pedido: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const sabores = useSelector((state: RootState) => state.sabores.items) as Sabor[];
  const loading = useSelector((state: RootState) => state.sabores.loading);
  const error = useSelector((state: RootState) => state.sabores.error);
  const sucursalId = useSelector((state: RootState) => state.user.sucursalId);
  const seleccionesRedux = useSelector((state: RootState) => state.pedido.selecciones);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const pedidoParsed: Record<string, number> = useMemo(() => {
    try {
      return pedido ? JSON.parse(decodeURIComponent(pedido)) : {};
    } catch {
      Alert.alert("Error", "No se pudo leer el pedido recibido");
      return {};
    }
  }, [pedido]);

  // 🔹 Al montar, limpiar selecciones previas y inicializar envases
  useEffect(() => {
    dispatch(limpiarPedido());
    Object.keys(pedidoParsed).forEach(envase => {
      dispatch(setSeleccion({ envaseId: envase, gustos: [] }));
      dispatch(toggleEnvase(envase));
    });
  }, [pedidoParsed, dispatch]);

  // Filtrar envases activos
  const envases = useMemo(() => Object.keys(pedidoParsed), [pedidoParsed]);

  const envaseActual = envases[currentIndex] ?? "";
  const maxSabores = pedidoParsed[envaseActual] ?? 0;
  const seleccionadosActual = seleccionesRedux[envaseActual] ?? [];

  // Inicializar selección del envase actual si no existe
  useEffect(() => {
    if (envaseActual && !seleccionesRedux[envaseActual]) {
      dispatch(setSeleccion({ envaseId: envaseActual, gustos: [] }));
    }
  }, [envaseActual]);

  // Cargar sabores desde API
  useEffect(() => {
    if (sucursalId) dispatch(fetchSabores(sucursalId));
  }, [sucursalId]);

  // Agrupar dinámicamente por la sección real del sabor (ya no se adivina por el nombre)
  const grupos = useMemo(() => {
    const res: Record<string, (Sabor & { label: string })[]> = {};
    const q = normalize(searchText);
    for (const s of sabores) {
      const label = labelOf(s);
      if (q && !normalize(label).includes(q)) continue;
      const g = s.categoria || "Especiales";
      if (!res[g]) res[g] = [];
      res[g].push({ ...s, label });
    }
    Object.keys(res).forEach(g => res[g].sort((a, b) => a.label.localeCompare(b.label)));
    return res;
  }, [sabores, searchText]);

  const toggleSeleccion = (nombreGusto: string) => {
    if (!envaseActual) return;

    let nueva: string[];
    if (seleccionadosActual.includes(nombreGusto)) {
      nueva = seleccionadosActual.filter(x => x !== nombreGusto);
    } else {
      nueva = [...seleccionadosActual, nombreGusto];
    }

    if (nueva.length > maxSabores) nueva = nueva.slice(0, maxSabores);

    dispatch(setSeleccion({ envaseId: envaseActual, gustos: nueva }));
  };

  const handleConfirm = () => {
    if (currentIndex < envases.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      router.push("/screens/Detalle_Pedido");
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PINK} />
        <Text style={{ marginTop: 10, color: MUTED }}>Cargando gustos...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={{ color: DANGER, fontSize: 16 }}>{error}</Text>
      </View>
    );

  const dataGrupos = Object.keys(grupos).sort();

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo2.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScreenHeader
          title={`Gustos para ${displayLabel(envaseActual)}`}
          showSearch
          onToggleSearch={() => setShowSearch(prev => !prev)}
        />

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
                { width: `${(seleccionadosActual.length / maxSabores) * 100}%` },
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
            const seleccionadasGrupo = seleccionadosActual.filter(s => opciones.includes(s));

            return (
              <View style={{ marginBottom: 12 }}>
                <Dropdown
                  label={grupo}
                  options={opciones}
                  selected={seleccionadasGrupo}
                  onSelect={toggleSeleccion}
                  icon={iconForGrupo(grupo)}
                />
              </View>
            );
          }}
        />

        <PedidoCardBottom
          selecciones={seleccionesRedux}
          visible
          onConfirm={handleConfirm}
          currentIndex={currentIndex}
          totalVolumenes={envases.length}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: "100%", height: "100%" },
  overlay: { flex: 1, padding: 20, backgroundColor: "rgba(255,255,255,0.55)" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  selectionContainer: { marginVertical: 12, alignItems: "center" },
  selectionLabel: { fontSize: 14, fontWeight: "600", marginBottom: 4, color: INK },
  progressBarBackground: {
    width: "80%",
    height: 12,
    backgroundColor: "#e8e8ec",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", backgroundColor: PINK, borderRadius: 6 },
  selectionCount: { marginTop: 4, fontSize: 12, color: MUTED },
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: INK },
});
