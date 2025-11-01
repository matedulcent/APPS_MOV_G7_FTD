import { BASE_URL } from "../../app/services/apiConfig";
import { logUserFailure, logUserPending, logUserSuccess } from "../actions/userActions";
import { AppDispatch } from "../store";
import { LoginCredentials, UserState } from "../types/userTypes";

export const loginUser = (credentials: LoginCredentials) => async (dispatch: AppDispatch) => {
    dispatch(logUserPending());

    try {
        const res = await fetch(`${BASE_URL}/api/usuarios/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: credentials.email.trim().toLowerCase(),
                password: credentials.password,
                role: credentials.role, // importante: cliente o vendedor
            }),
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
