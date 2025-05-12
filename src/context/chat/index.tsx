"use client";
import { createContext, FC, useReducer, Dispatch, useEffect, useContext } from "react";
import { Action } from "../app/action";
import { useAccount, useSignMessage, useWalletClient } from "wagmi";
import { Client } from "@xmtp/browser-sdk";
import initialState, { ChatState } from "./state";
import { SET_CHAT_CLIENT } from './actions'
import { createEOASigner } from "@/utils";
import reducer from "./reducer";

interface ContextProps {
    children: React.ReactNode;
}

export const ChatContext = createContext<[ChatState, Dispatch<Action>]>([
    initialState,
    () => {},
])

export const ChatContextProvider: FC<ContextProps> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const account = useAccount()
    const { data } = useWalletClient()
    const { signMessageAsync } = useSignMessage()

    useEffect(() => {
        const initClient = async () => {
            const connector = account.connector
 
            if (data?.account && connector) {
                const signer = createEOASigner(
                    data?.account?.address,
                    (message: string) => signMessageAsync({message})
                )
                
                try {
                    let xmtpClient = await Client.create(signer, {
                        env: 'production',
                    })
    
                    dispatch({
                        type: SET_CHAT_CLIENT,
                        payload: xmtpClient
                    })
                } catch (e) {
                    dispatch({
                        type: SET_CHAT_CLIENT,
                        payload: undefined
                    })

                    console.error("Error creating XMTP client", e)
                }
            }
        }

        initClient()
    }, [account.address, data?.account])

    return (
        <ChatContext.Provider value={[state, dispatch]}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext)
}
