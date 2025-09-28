// app/screens/Loading_Splash.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";

// Tiempo total antes de redirigir
const LOADING_MS = 12000;
// Duración de un ciclo de zoom (choco→fruti→cereza)
const CYCLE_MS = 900;
// Tamaño base del círculo
const CIRCLE = 600;

export default function Loading_Splash() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const isPreview = preview === "1" || preview === "true";
  const shouldRedirect = !isPreview;

  const [wink, setWink] = useState(false);
  const [ready, setReady] = useState(false); // ⬅️ bandera para arrancar zoom+shimmer

  // --------- VALORES ANIMADOS ----------
  // Entradas verticales
  const coneY   = useRef(new Animated.Value(100000)).current;  // aparece desde abajo
  const chocoY  = useRef(new Animated.Value(-100000)).current;  // caen desde arriba
  const frutiY  = useRef(new Animated.Value(-100000)).current;
  const cerezaY = useRef(new Animated.Value(-100000)).current;

  // Escalas (zoom, SOLO para bochas y cereza)
  const sChocolate = useRef(new Animated.Value(1)).current;
  const sFrutilla  = useRef(new Animated.Value(1)).current;
  const sCereza    = useRef(new Animated.Value(1)).current;

  // Tornasol del texto
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada: cono + caídas
    const coneIn = Animated.timing(coneY, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    });

    const dropChoco = Animated.spring(chocoY, {toValue: 0, friction: 12, tension: 70, useNativeDriver: true,});
    const dropFruti = Animated.spring(frutiY, {toValue: 0, friction: 12, tension: 70, useNativeDriver: true,});
    const dropCereza = Animated.spring(cerezaY, {toValue: 0, friction: 12, tension: 70, useNativeDriver: true,});

    const fallSequence = Animated.sequence([dropChoco, dropFruti, dropCereza]);

    Animated.sequence([coneIn, fallSequence]).start(() => {
      setReady(true); // cuando terminan → arrancar zoom/shimmer
    });

    // Al cumplirse LOADING_MS → guiño + redirección
    const to = setTimeout(() => {
      setWink(true);
      const afterWink = setTimeout(() => {
        if (shouldRedirect) router.replace("/screens/Log_In");
      }, 600);
      return () => clearTimeout(afterWink);
    }, LOADING_MS);

    return () => clearTimeout(to);
  }, [router, shouldRedirect]);

  // Cuando ready=true → arrancan los loops
  useEffect(() => {
    if (!ready) return;

    const jump = (val: Animated.Value, ms: number) =>
      Animated.sequence([
        Animated.timing(val, { toValue: 1.12, duration: Math.max(120, ms * 0.35), useNativeDriver: true }),
        Animated.spring(val, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
      ]);

    const zoomCycle = Animated.sequence([
      jump(sChocolate, CYCLE_MS / 3),
      jump(sFrutilla,  CYCLE_MS / 3),
      jump(sCereza,    CYCLE_MS / 3),
    ]);

    const zoomLoop = Animated.loop(zoomCycle);
    zoomLoop.start();

    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    );
    shimmerLoop.start();

    return () => {
      zoomLoop.stop();
      shimmerLoop.stop();
    };
  }, [ready]);

  // Color tornasolado
  const brandColor = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#B8860B", "#FFD700", "#C99700"],
  });

  return (
    <View style={styles.container}>
      {/* Fondo (opcional, si tenés waffle_bg.png) */}
      <Image
        source={require("../../assets/images/backgrounds/fondo5.png")}
        style={styles.bg}
        resizeMode="cover"
      />

      {/* Logo compuesto */}
      <View style={styles.logoArea}>
        <View style={styles.badge} />

        {/* CONO */}
        <Animated.Image
          source={require("../../assets/images/helados/cono_helado.png")}
          resizeMode="contain"
          style={[styles.cono, { transform: [{ translateY: coneY }] }]}
        />

        {/* CHOCOLATE */}
        <Animated.Image
          source={
            wink
              ? require("../../assets/images/helados/helado_chocolate_guinea.png")
              : require("../../assets/images/helados/helado_chocolate.png")
          }
          resizeMode="contain"
          style={[
            styles.choco,
            { transform: [{ translateY: chocoY }, { scale: sChocolate }] },
          ]}
        />

        {/* FRUTILLA */}
        <Animated.Image
          source={require("../../assets/images/helados/helado_frutilla.png")}
          resizeMode="contain"
          style={[
            styles.fruti,
            { transform: [{ translateY: frutiY }, { scale: sFrutilla }] },
          ]}
        />

        {/* CEREZA */}
        <Animated.Image
          source={require("../../assets/images/helados/cereza.png")}
          resizeMode="contain"
          style={[
            styles.cereza,
            { transform: [{ translateY: cerezaY }, { scale: sCereza }] },
          ]}
        />
      </View>

      {/* TEXTO */}
      <Animated.Text style={[styles.brand, { color: brandColor }]}>
        HELADOS HERMANOS
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" },
  bg: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    width: "100%", height: "100%",
  },
  logoArea: {
    width: CIRCLE,
    height: CIRCLE,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  badge: {
    position: "absolute",
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: "#D6EEF7",
  },
  cono: {
    position: "absolute",
    width: 700,
    height: 350,
    bottom: 2,
    right:-45,
    zIndex: 1,
  },
// Chocolate centrado abajo
  choco: {
    position: "absolute",
    width: 250,
    height: 300,
    top: 100, 
    left: 170,
    zIndex: 1,
  },
  // Frutilla arriba del chocolate
  fruti: {
    position: "absolute",
    width: 220,
    height: 200,
    bottom: 350, 
    left: 185,
    zIndex: 2,
  },
  // Cereza arriba de la frutilla
  cereza: {
    position: "absolute",
    width: 100,
    height: 270,
    top: -60,
    zIndex: 3,
    right: 245,
  },
  brand: {
    marginTop: 18,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
});
