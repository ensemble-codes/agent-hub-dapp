export interface AppState {
  taskPrompt: string;
  isWhitelisted: boolean;
}

const initialState: AppState = {
  taskPrompt: "",
  isWhitelisted: false
};

export default initialState;
