import { TOGGLE_ENVASE, UPDATE_CANTIDAD } from "../actionTypes/pedidoActionTypes";
import { EnvaseSeleccionado } from "../actions/pedidoActions";

interface PedidoState {
    envases: EnvaseSeleccionado[];
}

const initialState: PedidoState = {
    envases: [],
};

type Action =
    | { type: typeof TOGGLE_ENVASE; payload: string }
    | { type: typeof UPDATE_CANTIDAD; payload: { opcion: string; delta: number } }
    | { type: string; payload?: any }; // <-- permite acciones desconocidas de Redux

export default function pedidoReducer(
    state = initialState,
    action: Action
): PedidoState {
    switch (action.type) {
        case TOGGLE_ENVASE: {
            const index = state.envases.findIndex((e) => e.opcion === action.payload);
            if (index >= 0) {
                return {
                    ...state,
                    envases: state.envases.filter((e) => e.opcion !== action.payload),
                };
            } else {
                return {
                    ...state,
                    envases: [...state.envases, { opcion: action.payload, cantidad: 1 }],
                };
            }
        }
        case UPDATE_CANTIDAD: {
            const { opcion, delta } = action.payload;
            return {
                ...state,
                envases: state.envases.map((e) =>
                    e.opcion === opcion
                        ? { ...e, cantidad: Math.max(1, e.cantidad + delta) }
                        : e
                ),
            };
        }
        default:
            return state; // aquí ignoramos acciones desconocidas
    }
}
