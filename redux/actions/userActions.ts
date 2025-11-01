import { LOG_OUT, LOG_USER_FAILURE, LOG_USER_PENDING, LOG_USER_SUCCESS, UserState } from "../types/userTypes";

export const logUserPending = () => ({ type: LOG_USER_PENDING });
export const logUserSuccess = (userData: UserState) => ({ type: LOG_USER_SUCCESS, payload: userData });
export const logUserFailure = (error: string) => ({ type: LOG_USER_FAILURE, payload: error });
export const logOut = () => ({ type: LOG_OUT });
