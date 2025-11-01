import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BASE_URL } from "./../../services/apiConfig";

type Envase = { id: string; tipoEnvase: string; maxCantSabores: number };
type Sabor = { id: string; tipoSabor: string };

async function getCatalogoSabores(): Promise<Sabor[]> {
  const r = await fetch(`${BASE_URL}/api/sabores`);
  if (!r.ok) throw new Error("No se pudo leer /api/sabores");
  return r.json();
}
async function getOferta(
  sucursalId: string
): Promise<{ envases: Envase[]; sabores: Sabor[] }> {
  const r = await fetch(`${BASE_URL}/api/sucursales/${sucursalId}/oferta`);
  if (!r.ok) throw new Error("No se pudo leer oferta de sucursal");
  return r.json();
}
async function putOferta(
  sucursalId: string,
  envaseIds: string[],
  saborIds: string[]
): Promise<{ envases: Envase[]; sabores: Sabor[] }> {
  const payload = { envaseIds, saborIds };
  const r = await fetch(`${BASE_URL}/api/sucursales/${sucursalId}/oferta`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || "Error actualizando oferta");
  return data;
}

/* ===== helpers de clasificación ===== */
type Grupo =
  | "Cremas"
  | "Frutales"
  | "Dulce de leche"
  | "Chocolates"
  | "Especiales";

const ordenGrupos: Grupo[] = [
  "Cremas",
  "Frutales",
  "Dulce de leche",
  "Chocolates",
  "Especiales",
];

function normalize(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function grupoDeSabor(nombre: string): Grupo {
  const n = normalize(nombre);

  if (/(chocolate|choco|cacao|amargo|blanco|almendra|almendras|menta)/.test(n)) {
    return "Chocolates";
  }
  if (/(dulce de leche|ddl)/.test(n)) {
    return "Dulce de leche";
  }
  if (
    /(crema|americana|vainilla|tramontana|sambayon|flan|yogur|yogurt|ricota|panna|nata)/.test(
      n
    )
  ) {
    return "Cremas";
  }
  if (
    /(frutilla|fresa|limon|naranja|frambuesa|mora|maracuya|anan|piña|mango|durazno|melocoton|kiwi|uva|manzana|pera|cereza|sandia|melon|banana|platano)/.test(
      n
    )
  ) {
    return "Frutales";
  }
  return "Especiales";
}
/* ==================================== */

export default function Vendedor_Productos() {
  const { sucursalId: qp } = useLocalSearchParams<{ sucursalId?: string }>();
  const router = useRouter();
  const sucursalId = String(qp || "S1234");

  const [loading, setLoading] = useState(true);
  const [catalogoSabores, setCatalogoSabores] = useState<Sabor[]>([]);
  const [seleccionSabores, setSeleccionSabores] = useState<Set<string>>(
    new Set()
  );
  const [seleccionEnvases, setSeleccionEnvases] = useState<Set<string>>(
    new Set()
  );
  const [saving, setSaving] = useState(false);

  const [abierto, setAbierto] = useState<Record<Grupo, boolean>>({
    Cremas: false,
    Frutales: false,
    "Dulce de leche": false,
    Chocolates: false,
    Especiales: false,
  });

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [sabores, oferta] = await Promise.all([
        getCatalogoSabores(),
        getOferta(sucursalId),
      ]);
      setCatalogoSabores(sabores);
      setSeleccionSabores(new Set((oferta.sabores ?? []).map((s) => s.id)));
      setSeleccionEnvases(new Set((oferta.envases ?? []).map((e) => e.id)));
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo cargar la oferta");
    } finally {
      setLoading(false);
    }
  }, [sucursalId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const toggleSabor = async (id: string) => {
    if (saving) return;
    const next = new Set(seleccionSabores);
    next.has(id) ? next.delete(id) : next.add(id);

    setSeleccionSabores(next);
    setSaving(true);
    try {
      const data = await putOferta(sucursalId, [...seleccionEnvases], [...next]);
      setSeleccionEnvases(new Set((data.envases ?? []).map((e) => e.id)));
      setSeleccionSabores(new Set((data.sabores ?? []).map((s) => s.id)));
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo actualizar la oferta");
    } finally {
      setSaving(false);
    }
  };

  const irAPedidos = () =>
    router.push({
      pathname: "/screens/proveedor/Pedidos_Sucursal",
      params: { sucursalId },
    });

  const grupos = useMemo(() => {
    const map: Record<Grupo, Sabor[]> = {
      Cremas: [],
      Frutales: [],
      "Dulce de leche": [],
      Chocolates: [],
      Especiales: [],
    };
    for (const s of catalogoSabores) {
      map[grupoDeSabor(s.tipoSabor)].push(s);
    }
    (Object.keys(map) as Grupo[]).forEach((g) =>
      map[g].sort((a, b) => a.tipoSabor.localeCompare(b.tipoSabor))
    );
    return map;
  }, [catalogoSabores]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando gustos...</Text>
      </View>
    );
  }

  const gruposConContenido = ordenGrupos.filter(
    (g) => (grupos[g] ?? []).length > 0
  );

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      {/* TÍTULO CENTRADO */}
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: "900", textAlign: "center" }}>
          Gustos ofrecidos
        </Text>
      </View>

      {/* Contenido principal */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 12 }}
      >
        {gruposConContenido.map((g) => (
          <View
            key={g}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#e6e6e6",
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => setAbierto((prev) => ({ ...prev, [g]: !prev[g] }))}
              style={{
                padding: 12,
                backgroundColor: "#f5f5f5",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontWeight: "800" }}>{g}</Text>
              <Text style={{ opacity: 0.7 }}>{abierto[g] ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {abierto[g] &&
              (grupos[g] ?? []).map((item) => {
                const checked = seleccionSabores.has(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleSabor(item.id)}
                    style={{
                      padding: 12,
                      margin: 8,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: checked ? "#1e90ff" : "#ddd",
                      backgroundColor: checked ? "#eaf3ff" : "#fff",
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>{item.tipoSabor}</Text>
                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        opacity: 0.6,
                      }}
                    >
                      Tocar para {checked ? "quitar" : "agregar"} este sabor a
                      la oferta
                    </Text>
                  </Pressable>
                );
              })}
          </View>
        ))}
      </ScrollView>

      {/* Botones al pie */}
      <View style={{ gap: 10, marginTop: 4 }}>
        <Pressable
          onPress={irAPedidos}
          style={{
            padding: 14,
            borderRadius: 14,
            alignItems: "center",
            backgroundColor: "#222",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
            Volver a Pedidos
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
