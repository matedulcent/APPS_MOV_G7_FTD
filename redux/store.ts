import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userReducer";
import pedidoReducer from "./slices/pedidoSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        pedido: pedidoReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(), // incluye thunk por defecto
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
