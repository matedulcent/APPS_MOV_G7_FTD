// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user/slice";

export const store = configureStore({
    reducer: {
        user: userReducer,
    },
});

// Tipos para usar con TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

