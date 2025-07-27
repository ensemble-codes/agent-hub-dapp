import { ConnectedWallet } from "@privy-io/react-auth";
import { User } from "@/interface/user";

export interface AppState {
  taskPrompt: string;
  isWhitelisted: boolean;
  embeddedWallet: ConnectedWallet | undefined;
  user: User | null;
}

const initialState: AppState = {
  taskPrompt: "",
  isWhitelisted: false,
  embeddedWallet: undefined,
  user: null
};

export default initialState;
