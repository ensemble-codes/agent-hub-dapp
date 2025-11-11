import { UUID } from '../world-manager';
import { ConversationsAPI } from '../api/conversations-api';
import { ConversationResponse } from '@/types/conversations';

const CONVERSATION_STORAGE_PREFIX = 'conv_';

export class ConversationManager {
  /**
   * Get or create a conversation for a given user and agent
   */
  static async getOrCreateConversation(
    userId: UUID,
    agentId: UUID,
    options?: {
      agentAddress?: string;
      namespace?: string;
      roomId?: string;
    }
  ): Promise<{ conversationId: string; isNew: boolean }> {
    const storageKey = this.getStorageKey(userId, agentId);

    // Check if we have an existing conversation
    const existingConvId = localStorage.getItem(storageKey);

    if (existingConvId) {
      try {
        // Verify the conversation still exists
        await ConversationsAPI.getConversation(existingConvId);
        console.log(`[ConversationManager] Using existing conversation: ${existingConvId}`);
        return { conversationId: existingConvId, isNew: false };
      } catch (error) {
        console.warn(`[ConversationManager] Stored conversation ${existingConvId} not found, creating new one`, error);
        localStorage.removeItem(storageKey);
      }
    }

    // Create new conversation
    console.log(`[ConversationManager] Creating new conversation for user ${userId} and agent ${agentId}`);
    const roomId = options?.roomId || agentId; // Use roomId or fallback to agentId

    try {
      const conversation = await ConversationsAPI.createConversation({
        platformConversationId: roomId,
        platform: 'websocket',
        creatorId: userId,
        participants: [userId, agentId],
        name: `Chat with ${agentId}`,
        metadata: {
          agentAddress: options?.agentAddress,
          namespace: options?.namespace,
          roomId,
        },
      });

      // Store the conversation ID
      localStorage.setItem(storageKey, conversation.id);
      console.log(`[ConversationManager] Created new conversation: ${conversation.id}`);

      return { conversationId: conversation.id, isNew: true };
    } catch (error) {
      console.error('[ConversationManager] Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Get stored conversation ID for a user-agent pair
   */
  static getStoredConversationId(userId: UUID, agentId: UUID): string | null {
    const storageKey = this.getStorageKey(userId, agentId);
    return localStorage.getItem(storageKey);
  }

  /**
   * Clear stored conversation (for testing/reset)
   */
  static clearConversation(userId: UUID, agentId: UUID): void {
    const storageKey = this.getStorageKey(userId, agentId);
    localStorage.removeItem(storageKey);
    console.log(`[ConversationManager] Cleared conversation for ${userId} - ${agentId}`);
  }

  /**
   * List all conversations for a user
   */
  static async listUserConversations(userId: UUID): Promise<ConversationResponse[]> {
    try {
      const response = await ConversationsAPI.listConversations({
        participantId: userId,
        limit: 100,
        includeArchived: false,
      });
      return response.items;
    } catch (error) {
      console.error('[ConversationManager] Error listing conversations:', error);
      return [];
    }
  }

  /**
   * Validate user has access to a conversation
   */
  static async validateAccess(
    conversationId: string,
    userId: UUID
  ): Promise<boolean> {
    try {
      const conversation = await ConversationsAPI.getConversation(conversationId);
      return conversation.participants.includes(userId);
    } catch (error) {
      console.error('[ConversationManager] Access validation failed:', error);
      return false;
    }
  }

  /**
   * Clear all stored conversation data on logout
   */
  static clearAllConversations(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CONVERSATION_STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('[ConversationManager] Cleared all conversation data');
  }

  private static getStorageKey(userId: UUID, agentId: UUID): string {
    return `${CONVERSATION_STORAGE_PREFIX}${userId}_${agentId}`;
  }
}
