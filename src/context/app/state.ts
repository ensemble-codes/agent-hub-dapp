import { ConnectedWallet } from "@privy-io/react-auth";
import { User } from "@/interface/user";

export interface AppState {
  authLoading: boolean;
  taskPrompt: string;
  isWhitelisted: boolean;
  embeddedWallet: ConnectedWallet | undefined;
  user: User | null;
}

const initialState: AppState = {
  authLoading: true,
  taskPrompt: "",
  isWhitelisted: false,
  embeddedWallet: undefined,
  user: null
};

export default initialState;
