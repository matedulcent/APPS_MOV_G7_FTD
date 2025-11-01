import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type EnvaseSeleccionado = {
    opcion: string;
    cantidad: number;
};

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
            const item = state.envases.find(e => e.opcion === action.payload.opcion);
            if (item) {
                item.cantidad = Math.max(1, item.cantidad + action.payload.delta);
            }
        },
    },
});

export const { toggleEnvase, updateCantidad } = pedidoSlice.actions;
export default pedidoSlice.reducer;
