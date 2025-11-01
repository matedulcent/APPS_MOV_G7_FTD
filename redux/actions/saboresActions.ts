// saboresActions.ts
import { Dispatch } from "redux";
import { BASE_URL } from "../../app/services/apiConfig"; // ruta correcta según tu estructura
import { FETCH_SABORES_FAILURE, FETCH_SABORES_PENDING, FETCH_SABORES_SUCCESS } from "../actionTypes/saboresActionTypes";
import { Sabor } from "../types/saboresTypes";

export const fetchSabores = (sucursalId: string) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_SABORES_PENDING });

    try {
        const res = await fetch(`${BASE_URL}/api/sucursales/${sucursalId}/oferta`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Error al cargar sabores");
        dispatch({ type: FETCH_SABORES_SUCCESS, payload: data.sabores as Sabor[] });
    } catch (err: any) {
        dispatch({ type: FETCH_SABORES_FAILURE, payload: err.message || "Error" });
    }
};
