// store/user/types.ts
export type UserRole = "cliente" | "vendedor";

export interface UserState {
    userId?: string;
    sucursalId?: string;
    nombre?: string | null;
    email?: string | null;
    role?: UserRole;
    loggedIn: boolean;
    loading: boolean;
    error?: string | null;
}
