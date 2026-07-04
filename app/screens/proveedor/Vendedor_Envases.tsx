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
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BASE_URL } from "./../../services/apiConfig";

type Envase = { id: string; tipoEnvase: string; maxCantSabores: number };
type Sabor = { id: string; tipoSabor: string };

async function getCatalogoEnvases(): Promise<Envase[]> {
  const r = await fetch(`${BASE_URL}/api/envases`);
  if (!r.ok) throw new Error("No se pudo leer /api/envases");
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
  saborIds: string[],
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

// NUEVO: crear envase global en catálogo
async function postEnvase(payload: { tipoEnvase: string; maxCantSabores: number }) {
  const r = await fetch(`${BASE_URL}/api/envases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || "No se pudo crear el envase");
  return data as Envase;
}

// ===== helpers de UI (para agrupar y rotular) =====
type Grupo = "Conos" | "Kilo" | "Vasos" | "Especiales";

function grupoDe(tipoEnvase: string): Grupo {
  const k = (tipoEnvase.split("_")[0] || "").toLowerCase();
  if (k === "cucurucho") return "Conos";
  if (k === "kilo") return "Kilo";
  if (k === "vaso") return "Vasos";
  return "Especiales"; // antes "Otros"
}
function labelFor(tipoEnvase: string) {
  const [kindRaw, restRaw] = tipoEnvase.split("_");
  const kind = (kindRaw ?? "").toLowerCase();
  const rest = restRaw ?? "";
  if (kind === "kilo") {
    if (rest === "1") return "1 kg";
    if (rest === "0.5") return "1/2 kg";
    if (rest === "0.25") return "1/4 kg";
    return `${rest} kg`;
  }
  if (kind === "cucurucho") return `Cono ${rest}`;
  if (kind === "vaso") return `Vaso ${rest}`;
  // especiales: mostramos tal cual
  return tipoEnvase.replace("_", " ");
}
// ===================================================

export default function Vendedor_Envases() {
  const { sucursalId: qp } = useLocalSearchParams<{ sucursalId?: string }>();
  const router = useRouter();
  const sucursalId = String(qp || "S1234");
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [catalogoEnvases, setCatalogoEnvases] = useState<Envase[]>([]);
  const [seleccionEnvases, setSeleccionEnvases] = useState<Set<string>>(new Set());
  const [seleccionSabores, setSeleccionSabores] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const [abierto, setAbierto] = useState<Record<Grupo, boolean>>({
    Conos: false,
    Kilo: false,
    Vasos: false,
    Especiales: false,
  });

  // NUEVO: inputs por grupo para crear envases
  type NuevoEnvaseInputs = {
    rest: string;           // "1", "2" (bolas), "0.25" (kilos) o libre para especiales
    max: string;            // número como string para TextInput
  };
  const [nuevoPorGrupo, setNuevoPorGrupo] = useState<Record<Grupo, NuevoEnvaseInputs>>({
    Conos: { rest: "", max: "" },
    Kilo: { rest: "", max: "" },
    Vasos: { rest: "", max: "" },
    Especiales: { rest: "", max: "" },
  });

  const onChangeNuevo = (g: Grupo, field: keyof NuevoEnvaseInputs, v: string) =>
    setNuevoPorGrupo((prev) => ({ ...prev, [g]: { ...prev[g], [field]: v } }));

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [envases, oferta] = await Promise.all([
        getCatalogoEnvases(),
        getOferta(sucursalId),
      ]);
      setCatalogoEnvases(envases);
      setSeleccionEnvases(new Set((oferta.envases ?? []).map((e) => e.id)));
      setSeleccionSabores(new Set((oferta.sabores ?? []).map((s) => s.id)));
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo cargar la oferta");
    } finally {
      setLoading(false);
    }
  }, [sucursalId]);

  useEffect(() => { cargar(); }, [cargar]);

  const toggleEnvase = async (id: string) => {
    if (saving) return;
    const next = new Set(seleccionEnvases);
    next.has(id) ? next.delete(id) : next.add(id);

    setSeleccionEnvases(next);
    setSaving(true);
    try {
      const data = await putOferta(sucursalId, [...next], [...seleccionSabores]);
      setSeleccionEnvases(new Set((data.envases ?? []).map((e) => e.id)));
      setSeleccionSabores(new Set((data.sabores ?? []).map((s) => s.id)));
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo actualizar la oferta");
    } finally {
      setSaving(false);
    }
  };

  // NUEVO: crear envase global y recargar
  const crearEnvaseEnGrupo = async (g: Grupo) => {
    const { rest, max } = nuevoPorGrupo[g];
    const maxNum = Number(max);

    // Validaciones mínimas por grupo
    if (!rest.trim()) {
      Alert.alert("Dato requerido", g === "Kilo" ? "Ingresá 1, 0.5 o 0.25" :
        g === "Conos" || g === "Vasos" ? "Ingresá la cantidad de bolas" :
        "Ingresá un identificador (p. ej., especial_1)");
      return;
    }
    if (!Number.isFinite(maxNum) || maxNum <= 0) {
      Alert.alert("Dato requerido", "Ingresá la cantidad máxima de sabores (número > 0).");
      return;
    }

    // Construcción de tipoEnvase según convención actual
    const kind =
      g === "Conos" ? "cucurucho" :
      g === "Vasos" ? "vaso" :
      g === "Kilo" ? "kilo" :
      "especial";

    // Normalizamos rest para Kilo (permitimos 1, 0.5, 0.25)
    const restNorm = g === "Kilo"
      ? (rest === "1/2" ? "0.5" : rest.replace(",", "."))
      : rest;

    const tipoEnvase = `${kind}_${restNorm}`;

    try {
      await postEnvase({ tipoEnvase, maxCantSabores: maxNum });
      await cargar();
      setNuevoPorGrupo((prev) => ({ ...prev, [g]: { rest: "", max: "" } }));
      Alert.alert("Listo", `Se agregó "${labelFor(tipoEnvase)}".`);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo crear el envase");
    }
  };

  const irAPedidos = () =>
    router.push({ pathname: "/screens/proveedor/Pedidos_Sucursal", params: { sucursalId } });

  const grupos = useMemo(() => {
    const map: Record<Grupo, Envase[]> = { Conos: [], Kilo: [], Vasos: [], Especiales: [] };
    for (const e of catalogoEnvases) map[grupoDe(e.tipoEnvase)].push(e);
    (Object.keys(map) as Grupo[]).forEach((g) =>
      map[g].sort((a, b) => labelFor(a.tipoEnvase).localeCompare(labelFor(b.tipoEnvase)))
    );
    return map;
  }, [catalogoEnvases]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando envases...</Text>
      </View>
    );
  }

  const orden: Grupo[] = ["Conos", "Kilo", "Vasos", "Especiales"];
  const gruposConContenido = orden.filter((g) => (grupos[g] ?? []).length > 0 || true);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={{ padding: 16, paddingTop: insets.top + 16, borderBottomWidth: 1, borderColor: "#eee", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "800", textAlign: "center" }}>
          Envases ofrecidos
        </Text>
      </View>

      {/* Contenido */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {gruposConContenido.map((g) => (
          <View key={g} style={{ marginBottom: 12 }}>
            <TouchableOpacity
              onPress={() => setAbierto((prev) => ({ ...prev, [g]: !prev[g] }))}
              style={{
                padding: 12,
                backgroundColor: "#f7f7f7",
                borderRadius: 8,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontWeight: "800" }}>{g}</Text>
              <Text>{abierto[g] ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {abierto[g] &&
              grupos[g].map((item) => {
                const checked = seleccionEnvases.has(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => toggleEnvase(item.id)}
                    style={{
                      padding: 12,
                      marginTop: 6,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: checked ? "#1e90ff" : "#ddd",
                      backgroundColor: checked ? "#eaf3ff" : "#fff",
                    }}
                  >
                    <Text style={{ fontWeight: "700" }}>{labelFor(item.tipoEnvase)}</Text>
                    <Text style={{ opacity: 0.7 }}>Máx. sabores: {item.maxCantSabores}</Text>
                  </Pressable>
                );
              })}

            {/* NUEVO: input + botón para crear envase en este grupo */}
            {abierto[g] && (
              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <TextInput
                    placeholder={
                      g === "Kilo"
                        ? "Cantidad (1, 0.5, 0.25)"
                        : g === "Conos" || g === "Vasos"
                        ? "Bolas (1, 2, 3, 4)"
                        : "Identificador (ej: especial_1)"
                    }
                    keyboardType={g === "Especiales" ? "default" : "numeric"}
                    value={nuevoPorGrupo[g].rest}
                    onChangeText={(v) => onChangeNuevo(g, "rest", v)}
                    autoCapitalize="none"
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 12,
                      backgroundColor: "#fff",
                    }}
                  />
                  <TextInput
                    placeholder="Máx. sabores"
                    keyboardType="numeric"
                    value={nuevoPorGrupo[g].max}
                    onChangeText={(v) => onChangeNuevo(g, "max", v)}
                    style={{
                      width: 120,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 12,
                      backgroundColor: "#fff",
                    }}
                  />
                  <Pressable
                    onPress={() => crearEnvaseEnGrupo(g)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 12,
                      backgroundColor: "#1e90ff",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>+ Agregar</Text>
                  </Pressable>
                </View>
                <Text style={{ marginTop: 6, fontSize: 12, opacity: 0.6 }}>
                  El nuevo envase se guarda en el catálogo global y luego podés activarlo para esta
                  sucursal.
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 20,
          left: 16,
          right: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <Pressable
          onPress={irAPedidos}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            alignItems: "center",
            backgroundColor: "#222",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Volver a Pedidos</Text>
        </Pressable>
      </View>
    </View>
  );
}
