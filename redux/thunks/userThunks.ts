// redux/thunks/userThunks.ts
import { BASE_URL } from "../../app/services/apiConfig";
import { storage } from "../../app/services/storage";
import { logUserFailure, logUserPending, logUserSuccess } from "../actions/userActions";
import { AppDispatch } from "../store";
import { LoginCredentials, UserState } from "../types/userTypes";

export const loginUser = (credentials: LoginCredentials) => async (dispatch: AppDispatch) => {
  dispatch(logUserPending());

  try {
    // Endpoint según rol
    const url =
      credentials.role === "vendedor"
        ? `${BASE_URL}/api/sucursales/login`
        : `${BASE_URL}/api/usuarios/login`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data: any = await res.json();

    // Normalizar al shape de tu UserState
    const userPayload: Partial<UserState> = {
      userId: data.id || data.userId || data.ID_Usuario || "",
      nombre: data.nombre || "",
      email: data.email || credentials.email,
      role: credentials.role,                           // "cliente" | "vendedor"
      sucursalId: data.sucursalId || data.ID_Sucursal || null,
      loggedIn: true,
      loading: false,
      error: undefined,
    };

    // Guardar en Redux
    dispatch(logUserSuccess(userPayload as UserState));

    // Persistir para hidratar luego (en web usa localStorage, en native AsyncStorage)
    await storage.setItem("user", JSON.stringify(userPayload));

    console.log("[loginUser] Login OK =>", userPayload);
  } catch (err: any) {
    console.error("[loginUser] Error:", err);
    dispatch(logUserFailure(err?.message || "Error al iniciar sesión"));
  }
};
