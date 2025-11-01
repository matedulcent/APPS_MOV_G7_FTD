import { configureStore } from "@reduxjs/toolkit";
import saboresReducer from "./reducers/saboresReducer";
import userReducer from "./reducers/userReducer";
import pedidoReducer from "./slices/pedidoSlice";

export const store = configureStore({
    reducer: {
        sabores: saboresReducer,
        pedido: pedidoReducer,
        user: userReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
