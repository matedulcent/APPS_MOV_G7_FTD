// redux/thunks/userThunks.ts
import { BASE_URL } from "../../app/services/apiConfig";
import { parseApiError } from "../../app/services/apiError";
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
      const msg = await parseApiError(
        res,
        res.status === 401 ? "Email o contraseña incorrectos" : "No se pudo iniciar sesión"
      );
      throw new Error(msg);
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

    // Guardar en Redux (solo en memoria: la sesión no debe sobrevivir a cerrar la app)
    dispatch(logUserSuccess(userPayload as UserState));

    console.log("[loginUser] Login OK =>", userPayload);
  } catch (err: any) {
    // Login fallido (credenciales incorrectas, red caída) es un caso esperado
    // y ya se muestra en la UI — no usar console.error acá porque dispara el
    // overlay rojo de LogBox en cada intento.
    console.log("[loginUser] Login falló:", err?.message);
    dispatch(logUserFailure(err?.message || "Error al iniciar sesión"));
  }
};
