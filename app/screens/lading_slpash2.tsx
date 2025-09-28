import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, ImageBackground, StyleSheet, View } from "react-native";

const LOADING_MS = 6000;
const CYCLE_MS = 900;

export default function Loading_Splash() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const isPreview = preview === "1" || preview === "true";
  const shouldRedirect = !isPreview;

  const [wink, setWink] = useState(false);

  const sChocolate = useRef(new Animated.Value(1)).current;
  const sFrutilla  = useRef(new Animated.Value(1)).current;
  const sCereza    = useRef(new Animated.Value(1)).current;
  const shimmer    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const jump = (val: Animated.Value, ms: number) =>
      Animated.sequence([
        Animated.timing(val, { toValue: 1.12, duration: Math.max(120, ms * 0.35), useNativeDriver: true }),
        Animated.spring(val, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }),
      ]);

    const cycle = Animated.sequence([
      jump(sChocolate, CYCLE_MS / 3),
      jump(sFrutilla,  CYCLE_MS / 3),
      jump(sCereza,    CYCLE_MS / 3),
    ]);

    const loop = Animated.loop(cycle);
    loop.start();

    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    );
    shimmerLoop.start();

    const to = setTimeout(() => {
      loop.stop();
      setWink(true);
      const afterWink = setTimeout(() => {
        shimmerLoop.stop();
        if (shouldRedirect) router.replace("/screens/Log_In");
      }, 600);
      return () => clearTimeout(afterWink);
    }, LOADING_MS);

    return () => {
      clearTimeout(to);
      loop.stop();
      shimmerLoop.stop();
    };
  }, [router, shouldRedirect]);

  const brandColor = shimmer.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["#B8860B", "#FFD700", "#C99700"],
  });

  return (
    <ImageBackground
      source={require("../../assets/images/backgrounds/fondo5.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.logoArea}>
        <View style={styles.badge} />

        <Animated.Image
          source={
            wink
              ? require("../../assets/images/helados/helado_chocolate_guinea.png")
              : require("../../assets/images/helados/helado_chocolate.png")
          }
          resizeMode="contain"
          style={[styles.choco, { transform: [{ scale: sChocolate }] }]}
        />

        <Animated.Image
          source={require("../../assets/images/helados/helado_frutilla.png")}
          resizeMode="contain"
          style={[styles.fruti, { transform: [{ scale: sFrutilla }] }]}
        />

        <Animated.Image
          source={require("../../assets/images/helados/cereza.png")}
          resizeMode="contain"
          style={[styles.cereza, { transform: [{ scale: sCereza }] }]}
        />
      </View>

      <Animated.Text style={[styles.brand, { color: brandColor }]}>
        HELADOS HERMANOS
      </Animated.Text>
    </ImageBackground>
  );
}

const CIRCLE = 400;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  logoArea: {
    width: CIRCLE,
    height: CIRCLE,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: "#D6EEF7",
  },
  // Chocolate centrado abajo
  choco: {
    position: "absolute",
    width: 250,
    height: 300,
    top: 100, 
    left: 75,
    zIndex: 1,
  },
  // Frutilla arriba del chocolate
  fruti: {
    position: "absolute",
    width: 200,
    height: 190,
    bottom: 160, 
    zIndex: 2,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Cereza arriba de la frutilla
  cereza: {
    position: "absolute",
    width: 100,
    height: 270,
    top: -70,
    zIndex: 3,
    right: 145,
  },
  brand: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: 1.2,
    left:0,
  },
});
