import { UUID } from '../world-manager';
import { ConversationsAPI } from '../api/conversations-api';
import { ConversationResponse } from '@/types/conversations';

const CONVERSATION_STORAGE_PREFIX = 'conv_';
const CONVERSATION_LOCK_PREFIX = 'conv_lock_';

export class ConversationManager {
  /**
   * Generate unique platform conversation ID following the pattern:
   * {agentId}-{userId}-{timestamp}
   */
  private static generatePlatformConversationId(
    userId: UUID,
    agentId: UUID
  ): string {
    const timestamp = Date.now();
    const platformConversationId = `${agentId}-${userId}-${timestamp}`;
    console.log(`[ConversationManager] Generated platformConversationId: ${platformConversationId}`);
    return platformConversationId;
  }

  /**
   * Create a NEW conversation for a given user and agent
   * This ALWAYS creates a new conversation with a unique platform_conversation_id
   * to support multiple concurrent conversations with the same agent
   */
  static async createNewConversation(
    userId: UUID,
    agentId: UUID,
    options?: {
      agentAddress?: string;
      namespace?: string;
      roomId?: string;
    }
  ): Promise<{ conversationId: string; platformConversationId: string; isNew: boolean }> {
    // Generate unique platform conversation ID
    const platformConversationId = this.generatePlatformConversationId(userId, agentId);

    console.log(`[ConversationManager] Creating new conversation for user ${userId} and agent ${agentId}`);
    console.log(`[ConversationManager] Platform conversation ID: ${platformConversationId}`);

    try {
      const conversation = await ConversationsAPI.createConversation({
        platformConversationId,
        platform: 'websocket',
        creatorId: userId,
        participants: [userId, agentId],
        name: `Chat with ${agentId}`,
        metadata: {
          agentAddress: options?.agentAddress,
          namespace: options?.namespace,
          roomId: options?.roomId || platformConversationId,
          sessionStartedAt: new Date().toISOString(),
        },
      });

      console.log(`[ConversationManager] Created new conversation: ${conversation.id}`);

      return {
        conversationId: conversation.id,
        platformConversationId,
        isNew: true
      };
    } catch (error) {
      console.error('[ConversationManager] Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Get or create a conversation for a given user and agent
   * @deprecated Use createNewConversation() instead to support multiple conversations
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
    const lockKey = `${CONVERSATION_LOCK_PREFIX}${userId}_${agentId}`;

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

    // Implement a simple lock mechanism to prevent duplicate creation
    const existingLock = localStorage.getItem(lockKey);
    if (existingLock) {
      const lockTimestamp = parseInt(existingLock, 10);
      const now = Date.now();
      // If lock is less than 10 seconds old, wait and retry
      if (now - lockTimestamp < 10000) {
        console.log(`[ConversationManager] Another conversation creation in progress, waiting...`);
        // Wait a bit and check again for the conversation
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newConvId = localStorage.getItem(storageKey);
        if (newConvId) {
          console.log(`[ConversationManager] Found conversation created by concurrent call: ${newConvId}`);
          localStorage.removeItem(lockKey);
          return { conversationId: newConvId, isNew: false };
        }
      }
      // Lock is stale, remove it
      localStorage.removeItem(lockKey);
    }

    // Set lock
    localStorage.setItem(lockKey, Date.now().toString());

    // Generate unique platform conversation ID
    const platformConversationId = this.generatePlatformConversationId(userId, agentId);

    // Create new conversation
    console.log(`[ConversationManager] Creating new conversation for user ${userId} and agent ${agentId}`);

    try {
      const conversation = await ConversationsAPI.createConversation({
        platformConversationId,
        platform: 'websocket',
        creatorId: userId,
        participants: [userId, agentId],
        name: `Chat with ${agentId}`,
        metadata: {
          agentAddress: options?.agentAddress,
          namespace: options?.namespace,
          roomId: options?.roomId || platformConversationId,
        },
      });

      // Store the conversation ID
      localStorage.setItem(storageKey, conversation.id);
      console.log(`[ConversationManager] Created new conversation: ${conversation.id}`);

      // Remove lock
      localStorage.removeItem(lockKey);

      return { conversationId: conversation.id, isNew: true };
    } catch (error) {
      console.error('[ConversationManager] Error creating conversation:', error);
      // Remove lock on error
      localStorage.removeItem(lockKey);
      throw error;
    }
  }

  /**
   * Get conversation by platform_conversation_id (for loading from URL)
   */
  static async getConversationByPlatformId(
    platformConversationId: string
  ): Promise<ConversationResponse> {
    console.log(`[ConversationManager] Looking up conversation by platform ID: ${platformConversationId}`);

    try {
      // List conversations and find the one with matching platform_conversation_id
      const response = await ConversationsAPI.listConversations({
        limit: 100,
      });

      const conversation = response.items.find(
        (conv) => conv.platform_conversation_id === platformConversationId
      );

      if (!conversation) {
        throw new Error(`Conversation not found for platform_conversation_id: ${platformConversationId}`);
      }

      console.log(`[ConversationManager] Found conversation: ${conversation.id}`);
      return conversation;
    } catch (error) {
      console.error('[ConversationManager] Error looking up conversation:', error);
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
