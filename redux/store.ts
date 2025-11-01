// store.ts
import { configureStore } from "@reduxjs/toolkit";
import pedidoReducer from "./reducers/pedidoReducer";
import saboresReducer from "./reducers/saboresSlice"; // slice RTK
import userReducer from "./reducers/userReducer";

export const store = configureStore({
    reducer: {
        sabores: saboresReducer,
        pedido: pedidoReducer,
        user: userReducer,
    },
    // no hace falta configurar thunk, ya viene por defecto
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
