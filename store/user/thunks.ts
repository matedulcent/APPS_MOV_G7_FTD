import { createAsyncThunk } from "@reduxjs/toolkit";
import { BASE_URL } from "../../app/services/apiConfig";

interface LoginPayload {
    email: string;
    password: string;
    role: "cliente" | "vendedor";
}

export const loginUser = createAsyncThunk(
    "user/login",
    async (payload: LoginPayload, { rejectWithValue }) => {
        try {
            const res = await fetch(`${BASE_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.error ?? "Login failed");
            return data;
        } catch (err) {
            return rejectWithValue("No se pudo conectar con el servidor");
        }
    }
);
