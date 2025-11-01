// store/user/actions.ts
import { UserState } from "./types";

export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";
export const LOGOUT = "LOGOUT";

interface LoginRequestAction {
    type: typeof LOGIN_REQUEST;
}
interface LoginSuccessAction {
    type: typeof LOGIN_SUCCESS;
    payload: Partial<UserState>;
}
interface LoginFailureAction {
    type: typeof LOGIN_FAILURE;
    payload: string;
}
interface LogoutAction {
    type: typeof LOGOUT;
}

export type UserAction =
    | LoginRequestAction
    | LoginSuccessAction
    | LoginFailureAction
    | LogoutAction;

export const loginRequest = (): LoginRequestAction => ({ type: LOGIN_REQUEST });
export const loginSuccess = (data: Partial<UserState>): LoginSuccessAction => ({
    type: LOGIN_SUCCESS,
    payload: data,
});
export const loginFailure = (error: string): LoginFailureAction => ({
    type: LOGIN_FAILURE,
    payload: error,
});
export const logout = (): LogoutAction => ({ type: LOGOUT });
