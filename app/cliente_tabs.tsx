import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useLocalSearchParams } from "expo-router";
import React from "react";

import CategoriaEnvaseScreen from "./screens/Categoria_Envase";
import CategoriaGustosScreen from "./screens/Categoria_Gustos";
import PedidosClienteScreen from "./screens/Pedidos_Cliente";
import SeleccionSucursalScreen from "./screens/Seleccion_Sucursal";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PedirHeladoStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Seleccion" component={SeleccionSucursalScreen} />
      <Stack.Screen name="CategoriaEnvase" component={CategoriaEnvaseScreen} />
      <Stack.Screen name="CategoriaGustos" component={CategoriaGustosScreen} />
    </Stack.Navigator>
  );
}

export default function ClienteTabs() {
  const params = useLocalSearchParams<{ screen?: string; userId?: string }>();

  // Determina con qué tab iniciar (si no se especifica, arranca en "Pedir Helado")
  const initialTab = params.screen ?? "Pedir Helado";

  return (
    <Tab.Navigator
      initialRouteName={initialTab}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#f4679f",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "white", height: 60, paddingBottom: 6 },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "ellipse-outline";
          if (route.name === "Pedir Helado") iconName = "ice-cream-outline";
          else if (route.name === "Mis Pedidos") iconName = "list-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Pedir Helado" component={PedirHeladoStack} />
      <Tab.Screen name="Mis Pedidos" component={PedidosClienteScreen} />
    </Tab.Navigator>
  );
}
