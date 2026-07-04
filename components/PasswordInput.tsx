import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleProp,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type Props = Omit<TextInputProps, "secureTextEntry"> & {
  containerStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
};

/** Campo de contraseña con ícono de ojo para mostrar/ocultar el texto. */
export default function PasswordInput({
  style,
  containerStyle,
  iconColor = "#777",
  ...rest
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[{ justifyContent: "center" }, containerStyle]}>
      <TextInput
        {...rest}
        style={[style, { paddingRight: 42 }]}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity
        onPress={() => setVisible((v) => !v)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{ position: "absolute", right: 14 }}
      >
        <Ionicons name={visible ? "eye-off" : "eye"} size={20} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
}
