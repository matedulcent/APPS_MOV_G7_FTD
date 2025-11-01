import { TOGGLE_ENVASE, UPDATE_CANTIDAD } from "../actionTypes/pedidoActionTypes";

export type EnvaseSeleccionado = {
    opcion: string;
    cantidad: number;
};

export const toggleEnvase = (opcion: string) => ({
    type: TOGGLE_ENVASE,
    payload: opcion,
});

export const updateCantidad = (opcion: string, delta: number) => ({
    type: UPDATE_CANTIDAD,
    payload: { opcion, delta },
});
