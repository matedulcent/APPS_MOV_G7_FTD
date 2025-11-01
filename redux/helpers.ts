import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { RootState } from "./reducers";
import * as reduxThunks from "./thunks/userThunks";

function mapStateToProps(state: RootState) {
    return { user: state.user };
}

function mapDispatchToProps(dispatch: any) {
    return { ...bindActionCreators(reduxThunks, dispatch) };
}

export function connectScreen(screenComponent: any) {
    return connect(mapStateToProps, mapDispatchToProps)(screenComponent);
}
