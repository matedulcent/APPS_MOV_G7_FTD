// redux/slices/pedidoSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface EnvaseSeleccionado {
    opcion: string;
    cantidad: number;
}

interface PedidoState {
    envases: EnvaseSeleccionado[];
}

const initialState: PedidoState = {
    envases: [],
};

const pedidoSlice = createSlice({
    name: "pedido",
    initialState,
    reducers: {
        toggleEnvase: (state, action: PayloadAction<string>) => {
            const index = state.envases.findIndex(e => e.opcion === action.payload);
            if (index >= 0) {
                state.envases.splice(index, 1);
            } else {
                state.envases.push({ opcion: action.payload, cantidad: 1 });
            }
        },
        updateCantidad: (state, action: PayloadAction<{ opcion: string; delta: number }>) => {
            const { opcion, delta } = action.payload;
            const envase = state.envases.find(e => e.opcion === opcion);
            if (envase) envase.cantidad = Math.max(1, envase.cantidad + delta);
        },
    },
});

export const { toggleEnvase, updateCantidad } = pedidoSlice.actions;
export default pedidoSlice.reducer;
