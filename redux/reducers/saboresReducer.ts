import {
    FETCH_SABORES_FAILURE,
    FETCH_SABORES_PENDING,
    FETCH_SABORES_SUCCESS
} from "../actionTypes/saboresActionTypes";

interface SaboresState {
    items: any[];
    loading: boolean;
    error: string | null;
}

const initialState: SaboresState = {
    items: [],
    loading: false,
    error: null,
};

export default function saboresReducer(state = initialState, action: any): SaboresState {
    switch (action.type) {
        case FETCH_SABORES_PENDING:
            return { ...state, loading: true, error: null };
        case FETCH_SABORES_SUCCESS:
            return { ...state, loading: false, items: action.payload };
        case FETCH_SABORES_FAILURE:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}
