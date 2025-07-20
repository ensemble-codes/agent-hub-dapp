"use client";
import { createContext, FC, useEffect, useReducer } from "react";
import { Action } from "./action";
import reducer from "./reducer";
import initialState, { AppState } from "./state";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { SET_EMBEDDED_WALLET } from "./actions";

interface ContextProps {
  children: React.ReactNode;
}

export const AppContext = createContext<[AppState, React.Dispatch<Action>]>([
  initialState,
  () => {},
]);

export const AppContextProvider: FC<ContextProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
    if (authenticated && wallets && wallets.length) {
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
      dispatch({
        type: SET_EMBEDDED_WALLET,
        payload: embeddedWallet || wallets[0]
      })
    }
  }, [authenticated, wallets]);

  return (
    <AppContext.Provider value={[state, dispatch]}>
      {children}
    </AppContext.Provider>
  );
};
