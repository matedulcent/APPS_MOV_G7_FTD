// app/explore.tsx
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ExploreScreen() {
    return (
        <View style={styles.container}>
            {/* Botón arriba a la izquierda */}
            <View style={styles.header}>
                <Link href="/" asChild>
                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>⬅ Volver a Home</Text>
                    </Pressable>
                </Link>
            </View>

            <Text style={styles.text}>🔍 Esta es la pantalla Explore</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        padding: 16,
        paddingTop: 50,
    },
    header: {
        flexDirection: "row",
        justifyContent: "flex-start",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#03a9f4",
        padding: 10,
        borderRadius: 8,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    text: {
        fontSize: 20,
    },
});
