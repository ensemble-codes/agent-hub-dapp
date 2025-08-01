import { Action } from "./action";
import { SET_AUTH_LOADING, SET_EMBEDDED_WALLET, SET_IS_WHITELISTED, SET_TASK_PROMPT, SET_USER } from "./actions";
import { AppState } from "./state";

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case SET_TASK_PROMPT:
      return {
        ...state,
        taskPrompt: action.payload,
      };
    case SET_IS_WHITELISTED:
      return {
        ...state,
        isWhitelisted: action.payload
      }
      case SET_EMBEDDED_WALLET:
        return {
          ...state,
          embeddedWallet: action.payload
        }
      case SET_USER:
        return {
          ...state,
          user: action.payload
        }
      case SET_AUTH_LOADING:
        return {
          ...state,
          authLoading: action.payload
        }
    default:
      return state;
  }
};

export default reducer;

