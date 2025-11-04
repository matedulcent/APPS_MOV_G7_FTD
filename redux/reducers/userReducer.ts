import { LOG_OUT, LOG_USER_FAILURE, LOG_USER_PENDING, LOG_USER_SUCCESS, UserState } from "../types/userTypes";

const initialState: UserState = {
    userId: "",
    nombre: "",
    email: "",
    role: "cliente",
    loggedIn: false,
    loading: false,
    error: undefined,
    sucursalId: null,
};

interface Action {
    type: string;
    payload?: Partial<UserState> | string;
}

export default function userReducer(state = initialState, action: Action): UserState {
  switch (action.type) {
    case LOG_USER_PENDING:
      return { ...state, loading: true, error: undefined };

    case LOG_USER_SUCCESS:
      const payloadData = action.payload as Partial<UserState> | undefined;
      return { ...state, ...payloadData, loading: false, loggedIn: true, error: undefined };

    case LOG_USER_FAILURE:
      return { ...state, loading: false, loggedIn: false, error: action.payload as string };

    case LOG_OUT:
      return { ...initialState };

    case "SET_SUCURSAL":
      return { ...state, sucursalId: action.payload as string };

    // 🔹 NUEVO CASO para hidratar desde AsyncStorage
    case "HYDRATE_USER":
        return { ...state, ...((action.payload as Partial<UserState>) ?? {}), loggedIn: true };

    default:
      return state;
  }

}
