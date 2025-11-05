import { combineReducers } from "redux";
import pedidoReducer from "./pedidoReducer";
import userReducer from "./userReducer";

const rootReducer = combineReducers({
    user: userReducer,
    pedido: pedidoReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
