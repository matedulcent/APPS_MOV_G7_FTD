// store/user/reducer.ts
import { LOGIN_FAILURE, LOGIN_REQUEST, LOGIN_SUCCESS, LOGOUT, UserAction } from "./actions";
import { UserState } from "./types";

const initialState: UserState = {
    loggedIn: false,
    loading: false,
    error: null,
};

export const userReducer = (state = initialState, action: UserAction): UserState => {
    switch (action.type) {
        case LOGIN_REQUEST:
            return { ...state, loading: true, error: null };
        case LOGIN_SUCCESS:
            return { ...state, ...action.payload, loggedIn: true, loading: false, error: null };
        case LOGIN_FAILURE:
            return { ...state, loading: false, error: action.payload };
        case LOGOUT:
            return initialState;
        default:
            return state;
    }
};
