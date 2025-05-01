import { Action } from "./action";
import { SET_IS_WHITELISTED, SET_TASK_PROMPT } from "./actions";
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
    default:
      return state;
  }
};

export default reducer;

