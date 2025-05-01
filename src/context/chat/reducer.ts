import { Action } from "../app/action";
import { SET_CHAT_CLIENT } from "./actions";
import { ChatState } from "./state";

const reducer = (state: ChatState, action: Action) => {
    switch (action.type) {
        case SET_CHAT_CLIENT:
            return {
                ...state,
                client: action.payload
            }
        default:
            return state;
    }
}

export default reducer;
