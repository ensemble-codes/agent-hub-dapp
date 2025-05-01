import { Client } from '@xmtp/browser-sdk'

export interface ChatState {
  client: Client | undefined;
}

const initialState: ChatState = {
  client: undefined,
}

export default initialState;
