import { useCallback, useEffect, useMemo, useState } from "react";
import { useXMTP } from "@/context/XMTPContext";
import { Conversation, DecodedMessage } from "@xmtp/browser-sdk";

type FormattedMessage = {
  id: string;
  content: string;
  isReceived: boolean;
  timestamp: number;
};

export function useConversation(address?: string) {
  const { client } = useXMTP();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<FormattedMessage[]>([]);

  useEffect(() => {
    const getConversation = async () => {
      if (!client || !address) return;

      await client.conversations.syncAll()

      const dmConversation = await client.conversations.newDmWithIdentifier({
        identifierKind: "Ethereum",
        identifier: address.toLowerCase(),
      });

      setConversation(dmConversation);
    };

    getConversation();
  }, [client, address]);

  const indexId = useMemo(() =>  {
    if (!client) return null;

    return client.inboxId
  }, [client])

  const formatMessage = useCallback((message: DecodedMessage): FormattedMessage | null => {
    if (typeof message.content !== 'string') {
      return null
    }

    return {
      id: message.id,
      content: message.content,
      isReceived: message.senderInboxId !== indexId,
      timestamp: message.sentAtNs ? Number(message.sentAtNs) / 1_000_000 : Date.now()
    }
  }, [indexId])

  const addMessageToState = useCallback((newMessage: FormattedMessage) => {
    setMessages((prevMessages) => {
      // Check if message already exists
      const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
      if (messageExists) {
        return prevMessages;
      }
      
      // Add new message and sort by timestamp
      const updatedMessages = [...prevMessages, newMessage];
      return updatedMessages.sort((a, b) => a.timestamp - b.timestamp);
    });
  }, []);

  const getMessages = useCallback(async () => {
    if (!conversation) return;

    try {
      const msgs = (await conversation.messages()) ?? [];
      const formattedMessages = msgs
        .map(formatMessage)
        .filter((msg): msg is FormattedMessage => msg !== null)
        .sort((a, b) => a.timestamp - b.timestamp);
      
      setMessages(formattedMessages);
    } finally {
      setLoading(false);
    }
  }, [conversation, formatMessage]);

  const sync = useCallback(async () => {
    if (!conversation) return;

    setSyncing(true);

    try {
      await conversation.sync();
    } finally {
      setSyncing(false);
    }
  }, [conversation]);

  const send = useCallback(
    async (message: string) => {
      if (!conversation) return;

      setSending(true);

      try {
        await conversation.send(message);
      } finally {
        setSending(false);
      }
    },
    [conversation]
  );

  const streamMessages = useCallback(async () => {
    const noop = () => {};

    if (!conversation) return noop;

    try {
      const stream = await conversation.stream(
        (error: Error | null, message: DecodedMessage | undefined) => {
          if (error) {
            console.error("Error streaming messages", error);
            return;
          }

          if (message) {
            const formattedMessage = formatMessage(message);
            if (!formattedMessage) return;
            
            addMessageToState(formattedMessage);
          }
        }
      );

      return stream
        ? () => {
            try {
              stream.return(undefined);
            } catch (e) {
              console.error("Error closing stream", e);
            }
          }
        : noop;
    } catch (e) {
      console.error("Error setting up stream", e);
      return noop;
    }
  }, [conversation, formatMessage, addMessageToState]);

  return {
    getMessages,
    conversation,
    loading,
    syncing,
    sending,
    messages,
    sync,
    send,
    streamMessages
  };
} 