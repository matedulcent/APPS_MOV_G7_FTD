import { BASE_URL } from "../../app/services/apiConfig";
import { fetchSaboresFailure, fetchSaboresPending, fetchSaboresSuccess } from "../actions/saboresActions";

export const fetchSabores = (sucursalId: string) => {
    return async (dispatch: any) => {
        dispatch(fetchSaboresPending());
        try {
            const res = await fetch(`${BASE_URL}/api/sucursales/${sucursalId}/oferta`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Error al cargar sabores");
            dispatch(fetchSaboresSuccess(data?.sabores ?? []));
        } catch (e: any) {
            dispatch(fetchSaboresFailure(e.message || "Error desconocido"));
        }
    };
};
