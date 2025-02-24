import { Action } from "./action";
import { SET_IS_WHITELISTED, SET_TASK_PROMPT } from "./actions";
import State from "./statemodel";

const reducer = (state: State, action: Action): State => {
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

