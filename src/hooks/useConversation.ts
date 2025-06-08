import { useCallback, useEffect, useMemo, useState } from "react";
import { useXMTP } from "@/context/XMTPContext";
import { Conversation, DecodedMessage } from "@xmtp/browser-sdk";

export function useConversation(address?: string) {
  const { client } = useXMTP();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<{ content: string; isReceived: boolean }[]>([]);

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

  const formatMessage = useCallback((message: DecodedMessage) => {
    if (typeof message.content !== 'string') {
      return null
    }

    return {
      content: message.content,
      isReceived: message.senderInboxId !== indexId
    }
  }, [indexId])

  const getMessages = useCallback(async () => {
    if (!conversation) return;

    try {
      const msgs = (await conversation.messages()) ?? [];
      const formattedMessages = msgs.map(formatMessage).filter((msg) => msg !== null);
      setMessages(formattedMessages);
    } finally {
      setLoading(false);
    }
  }, [conversation]);

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
            
            setMessages((prev) => [...prev, formattedMessage]);
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
  }, [conversation, formatMessage]);

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