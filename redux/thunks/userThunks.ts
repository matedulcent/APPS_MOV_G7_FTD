import { BASE_URL } from "../../app/services/apiConfig";
import { logUserFailure, logUserPending, logUserSuccess } from "../actions/userActions";
import { AppDispatch } from "../store";
import { UserState } from "../types/userTypes";

interface LoginCredentials {
    email: string;
    password: string;
    role: "cliente" | "vendedor";
}

export const loginUser = (credentials: LoginCredentials) => async (dispatch: AppDispatch) => {
    dispatch(logUserPending());
    try {
        const res = await fetch(`${BASE_URL}/api/usuarios/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const data: UserState = await res.json();
        dispatch(logUserSuccess(data));
    } catch (err: any) {
        dispatch(logUserFailure(err.message || "Error al iniciar sesión"));
    }
};
