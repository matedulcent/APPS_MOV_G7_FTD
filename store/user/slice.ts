import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserState = {
    loggedIn: boolean;
    role?: "cliente" | "vendedor";
    userId?: string;
    sucursalId?: string;
    loading: boolean;
    error?: string | null;
};

const initialState: UserState = {
    loggedIn: false,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginStart(state) {
            state.loading = true;
            state.error = null;
        },
        loginSuccessCliente(state, action: PayloadAction<{ userId: string }>) {
            state.loading = false;
            state.loggedIn = true;
            state.role = "cliente";
            state.userId = action.payload.userId;
        },
        loginSuccessVendedor(state, action: PayloadAction<{ sucursalId: string }>) {
            state.loading = false;
            state.loggedIn = true;
            state.role = "vendedor";
            state.sucursalId = action.payload.sucursalId;
        },
        loginError(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        logout(state) {
            state.loggedIn = false;
            state.role = undefined;
            state.userId = undefined;
            state.sucursalId = undefined;
        },
    },
});

export const { loginStart, loginSuccessCliente, loginSuccessVendedor, loginError, logout } = userSlice.actions;
export default userSlice.reducer;
