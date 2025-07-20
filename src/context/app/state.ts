import { ConnectedWallet } from "@privy-io/react-auth";

export interface AppState {
  taskPrompt: string;
  isWhitelisted: boolean;
  embeddedWallet: ConnectedWallet | undefined;
}

const initialState: AppState = {
  taskPrompt: "",
  isWhitelisted: false,
  embeddedWallet: undefined
};

export default initialState;
