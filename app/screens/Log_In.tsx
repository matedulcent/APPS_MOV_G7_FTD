import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from "react-native";

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const handleSubmit = (event: any) => {
        event.preventDefault();
        // TODO: Implement login logic
    };  
    
    const router = useRouter();
    

    return (
        <View>
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            <Pressable style={styles.button} onPress={() => router.push("/")}>
                <Text style={styles.buttonText}>⬅️ Back to Home</Text>
            </Pressable>
        </View> 
    );
};

const styles = StyleSheet.create({

  button: {
    marginBlock: 8,
    marginTop: 30,
    backgroundColor: "#6200ee",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 18 },


});

export default LoginForm;


