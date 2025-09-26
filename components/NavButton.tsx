import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

type NavButtonProps = {
    text: string;
    route: string;
    color?: string;
    style?: ViewStyle | ViewStyle[];
};

export default function NavButton({ text, route, color = "#6200ee", style }: NavButtonProps) {
    // Combinar estilos manualmente para web
    const combinedStyle = StyleSheet.flatten([styles.button, { backgroundColor: color }, style]);

    return (
        <Link href={route as any} asChild>
            <Pressable style={combinedStyle}>
                <Text style={styles.text}>{text}</Text>
            </Pressable>
        </Link>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 100,
    },
    text: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});
