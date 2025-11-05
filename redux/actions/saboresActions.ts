import { Dispatch } from "redux";
import { BASE_URL } from "../../app/services/apiConfig";
import { FETCH_SABORES_FAILURE, FETCH_SABORES_PENDING, FETCH_SABORES_SUCCESS } from "../actionTypes/saboresActionTypes";
import { Sabor } from "../types/saboresTypes";

// Acciones clásicas
export const fetchSaboresPending = () => ({ type: FETCH_SABORES_PENDING });
export const fetchSaboresSuccess = (sabores: Sabor[]) => ({ type: FETCH_SABORES_SUCCESS, payload: sabores });
export const fetchSaboresFailure = (error: string) => ({ type: FETCH_SABORES_FAILURE, payload: error });

// Thunk clásico
export const fetchSabores = (sucursalId: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(fetchSaboresPending());
        try {
            const res = await fetch(`${BASE_URL}/api/sucursales/${sucursalId}/oferta`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Error al cargar sabores");
            dispatch(fetchSaboresSuccess(data?.sabores ?? []));
        } catch (err: any) {
            dispatch(fetchSaboresFailure(err.message || "Error desconocido"));
        }
    };
};
