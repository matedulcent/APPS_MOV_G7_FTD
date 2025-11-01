// src/redux/slices/pedidoSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface EnvaseSeleccion {
    opcion: string; // tipoEnvase, ej: "kilo_1", "cucurucho_2"
    cantidad: number;
}

interface PedidoState {
    envases: EnvaseSeleccion[];
    selecciones: Record<string, string[]>; // gustos por envase
}

const initialState: PedidoState = {
    envases: [],
    selecciones: {},
};

const pedidoSlice = createSlice({
    name: "pedido",
    initialState,
    reducers: {
        // 🔹 Agregar o quitar un envase de la lista
        toggleEnvase(state, action: PayloadAction<string>) {
            const opcion = action.payload;
            const existente = state.envases.find((e) => e.opcion === opcion);
            if (existente) {
                // si ya estaba, lo quita
                state.envases = state.envases.filter((e) => e.opcion !== opcion);
            } else {
                // si no estaba, lo agrega con cantidad 1
                state.envases.push({ opcion, cantidad: 1 });
            }
        },

        // 🔹 Aumentar o disminuir la cantidad de un envase
        updateCantidad(state, action: PayloadAction<{ opcion: string; delta: number }>) {
            const { opcion, delta } = action.payload;
            const env = state.envases.find((e) => e.opcion === opcion);
            if (env) {
                env.cantidad = Math.max(0, env.cantidad + delta);
                // eliminar si llega a 0
                if (env.cantidad === 0) {
                    state.envases = state.envases.filter((e) => e.opcion !== opcion);
                }
            }
        },

        // 🔹 Guardar gustos seleccionados por envase
        setSeleccion(state, action: PayloadAction<{ envaseId: string; gustos: string[] }>) {
            const { envaseId, gustos } = action.payload;
            state.selecciones[envaseId] = gustos;
        },

        // 🔹 Limpiar todo el pedido
        limpiarPedido(state) {
            state.envases = [];
            state.selecciones = {};
        },
    },
});

export const { toggleEnvase, updateCantidad, setSeleccion, limpiarPedido } = pedidoSlice.actions;
export default pedidoSlice.reducer;
