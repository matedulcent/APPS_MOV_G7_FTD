export interface UserState {
    userId: string;
    nombre: string;
    email: string;
    role: "cliente" | "vendedor";
    loggedIn: boolean;
    loading: boolean;
    error?: string;
    sucursalId?: string | null;
}
export interface LoginCredentials {
    email: string;
    password: string;
    role: "cliente" | "vendedor";
}


// Accion types
export const LOG_USER_PENDING = "LOG_USER_PENDING";
export const LOG_USER_SUCCESS = "LOG_USER_SUCCESS";
export const LOG_USER_FAILURE = "LOG_USER_FAILURE";
export const LOG_OUT = "LOG_OUT";
