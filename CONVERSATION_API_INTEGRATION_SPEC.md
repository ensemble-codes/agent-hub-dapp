# Conversation API Integration Specification

## Executive Summary

This specification outlines the integration of the Conversations API into the existing websocket chat system and Socket.IO v0 manager. Currently, the chat system uses ephemeral room IDs without persistent conversation tracking, making it impossible to:

- Retrieve historical messages across sessions
- Track conversation metadata and analytics
- Manage participants systematically
- Archive or restore conversations
- Implement features like read receipts, conversation summaries, etc.

This integration will enable full conversation lifecycle management with persistent history, analytics, and advanced conversation features built from the ground up.

---

## Table of Contents

1. [Current Architecture Analysis](#current-architecture-analysis)
2. [API Endpoints Overview](#api-endpoints-overview)
3. [Data Models](#data-models)
4. [Integration Architecture](#integration-architecture)
5. [Implementation Plan](#implementation-plan)
6. [Testing Strategy](#testing-strategy)
7. [Security Considerations](#security-considerations)

---

## 1. Current Architecture Analysis

### 1.1 Current Flow

```text
WebsocketChat Component
    ↓
Initialize Room ID (generateRoomId)
    ↓
SocketIOManager.initialize()
    ↓
SocketIOManager.joinRoom(roomId)
    ↓
Real-time messaging (ephemeral)
    ↓
SessionStorage (temporary, cleared on refresh)
```

### 1.2 Limitations

- **No Persistence**: Room IDs are generated client-side and not tracked server-side
- **No History**: Messages are lost when session ends
- **No Conversation Context**: Cannot retrieve metadata, participants, or analytics
- **No Multi-Device Sync**: Each device/session starts fresh
- **Limited Recovery**: SessionStorage used temporarily but cleared after use

### 1.3 Current Implementation Files

- `src/components/chat/websocket-chat.tsx` - Main chat UI component
- `src/lib/eliza/socket-io-manager-v0.tsx` - Socket.IO connection manager
- `src/lib/world-manager.ts` - Room ID generation utilities

---

## 2. API Endpoints Overview

### 2.1 Conversation Management

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/communication/conversations/` | Create new conversation |
| GET | `/api/v1/communication/conversations/` | List conversations (paginated, filtered) |
| GET | `/api/v1/communication/conversations/{id}` | Get conversation details |
| PUT | `/api/v1/communication/conversations/{id}` | Update conversation metadata |
| POST | `/api/v1/communication/conversations/{id}/archive` | Archive conversation |
| POST | `/api/v1/communication/conversations/{id}/restore` | Restore archived conversation |

### 2.2 Participant Management

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/communication/conversations/{id}/participants` | Add participant |
| DELETE | `/api/v1/communication/conversations/{id}/participants/{participant_id}` | Remove participant |

### 2.3 Message History & Analytics

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/communication/messages/conversations/{id}` | Get message history (paginated) |
| POST | `/api/v1/communication/messages/conversations/{id}/mark-read` | Mark messages as read |
| GET | `/api/v1/communication/conversations/{id}/summary` | Get AI-generated summary |
| GET | `/api/v1/communication/conversations/{id}/analytics` | Get conversation analytics |

---

## 3. Data Models

### 3.1 CreateConversationRequest

```typescript
interface CreateConversationRequest {
  platform_conversation_id: string;        // Required: Platform's native conversation ID
  conversation_id?: string | null;         // Optional: Custom UUID (auto-generated if null)
  name?: string | null;                    // Optional: Human-readable name
  platform?: PlatformType;                 // Default: "websocket"
  creator_id?: string | null;              // Optional: Creator user ID
  participants?: string[] | null;          // Optional: Initial participant IDs
  metadata?: Record<string, any> | null;   // Optional: Additional metadata
}

type PlatformType = "websocket" | "telegram" | "discord" | "x" | "whatsapp";
```

### 3.2 ConversationResponse

```typescript
interface ConversationResponse {
  id: string;                              // Universal conversation identifier
  name?: string | null;                    // Human-readable name
  description?: string | null;             // Conversation description
  platform: PlatformType;                  // Primary platform
  platform_conversation_id: string;        // Platform's native ID
  platform_metadata: Record<string, any>;  // Platform-specific data
  participants: string[];                  // List of participant IDs
  created_by?: string | null;              // Creator ID
  message_count: number;                   // Total message count
  last_message_at?: string | null;         // ISO 8601 timestamp
  is_active: boolean;                      // Active status
  archived_at?: string | null;             // Archive timestamp
  metadata: Record<string, any>;           // Additional data
  tags: string[];                          // Conversation tags
  created_at: string;                      // ISO 8601 timestamp
  updated_at: string;                      // ISO 8601 timestamp
}
```

### 3.3 MessageResponse

```typescript
interface MessageResponse {
  id: string;                              // Unique message identifier
  conversation_id: string;                 // Parent conversation ID
  platform_context: PlatformContextResponse; // Platform-specific context
  text: string;                            // Message text
  attachments: AttachmentResponse[];       // Message attachments
  sender_id: string;                       // Sender identifier
  sender_name: string;                     // Display name
  sender_type: SenderType;                 // "user" | "agent" | "system"
  status: MessageStatus;                   // "sending" | "sent" | "delivered" | "read" | "failed"
  metadata: Record<string, any>;           // Additional metadata
  thread_id?: string | null;               // Parent message for threading
  reaction_count: number;                  // Number of reactions
  is_edited: boolean;                      // Edit flag
  edit_history: Record<string, any>[];     // Edit history
  created_at: string;                      // ISO 8601 timestamp
  updated_at: string;                      // ISO 8601 timestamp
  deleted_at?: string | null;              // Soft delete timestamp
}

interface PlatformContextResponse {
  platform: PlatformType;
  room_id?: string | null;
  channel_id?: string | null;
  thread_id?: string | null;
  server_id?: string | null;
  metadata: Record<string, any>;
}
```

### 3.4 PaginatedMessagesResponse

```typescript
interface PaginatedMessagesResponse {
  items: MessageResponse[];                // List of messages
  total: number;                           // Total message count
  limit: number;                           // Messages per page
  offset: number;                          // Number of messages skipped
  has_more: boolean;                       // More messages available
}
```

---

## 4. Integration Architecture

### 4.1 New Conversation Flow

```text
WebsocketChat Component
    ↓
[NEW] Check for existing conversation in localStorage
    ↓ (if none exists)
[NEW] API: Create Conversation (POST /api/v1/communication/conversations/)
    ↓
[NEW] Store conversation_id in localStorage
    ↓
SocketIOManager.initialize(conversation_id)
    ↓
SocketIOManager.joinRoom(roomId, conversation_id)
    ↓
[NEW] API: Fetch Message History (GET /api/v1/communication/messages/conversations/{id})
    ↓
Display historical messages + real-time messaging
    ↓
[NEW] API: Mark messages as read (POST /api/v1/communication/messages/conversations/{id}/mark-read)
```

### 4.2 Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────┐
│                    WebsocketChat Component                   │
│  - Manages UI state                                          │
│  - Conversation lifecycle                                    │
│  - Message history loading                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├─────────────────┬──────────────────┐
                       ↓                 ↓                  ↓
          ┌────────────────────┐  ┌──────────────┐  ┌─────────────────┐
          │ ConversationManager │  │ SocketIOManager│  │ MessageHistory │
          │  - Create/Get conv  │  │  - Real-time    │  │  - Fetch history│
          │  - Store conv ID    │  │  - Send messages│  │  - Pagination   │
          │  - Manage metadata  │  │  - Join rooms   │  │  - Caching      │
          └────────┬───────────┘  └────────┬───────┘  └────────┬────────┘
                   │                       │                   │
                   ↓                       ↓                   ↓
          ┌────────────────────────────────────────────────────────┐
          │              REST API (localhost:8000)                 │
          │  - Conversation CRUD                                   │
          │  - Message history                                     │
          │  - Analytics & summaries                               │
          └────────────────────────────────────────────────────────┘
```

### 4.3 Data Flow

```text
1. Component Mount
   ├─> Load entityId (user ID) from localStorage
   ├─> Generate/retrieve conversationKey: `conv_${entityId}_${agentId}`
   ├─> Check localStorage for existing conversation_id
   └─> If none, create new conversation via API

2. Conversation Creation
   ├─> POST /api/v1/communication/conversations/
   ├─> Request body: {
   │     platform_conversation_id: roomId,
   │     platform: "websocket",
   │     creator_id: entityId,
   │     participants: [entityId, agentId],
   │     metadata: { agentAddress, namespace }
   │   }
   ├─> Store conversation_id in localStorage
   └─> Continue with socket initialization

3. Message History Load
   ├─> GET /api/v1/communication/messages/conversations/{conversation_id}
   ├─> Query params: { limit: 50, offset: 0 }
   ├─> Transform API messages to UI format
   └─> Set initial messages state

4. Real-time Messaging
   ├─> User sends message via SocketIOManager
   ├─> Message broadcast received from server
   ├─> Update UI immediately (optimistic update)
   └─> Message persisted automatically by backend

5. Message Read Status
   ├─> On message received or scroll into view
   └─> POST /api/v1/communication/messages/conversations/{conversation_id}/mark-read
```

---

## 5. Implementation Plan

### 5.1 Phase 1: Core Infrastructure (Week 1)

#### 5.1.1 Create API Service Layer

**File**: `src/lib/api/conversations-api.ts`

```typescript
import { UUID } from '../world-manager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export class ConversationsAPI {
  private static async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new conversation
   */
  static async createConversation(params: {
    platformConversationId: string;
    platform?: 'websocket' | 'telegram' | 'discord' | 'x' | 'whatsapp';
    creatorId: string;
    participants: string[];
    name?: string;
    metadata?: Record<string, any>;
  }): Promise<ConversationResponse> {
    const response = await this.fetch<{ data: ConversationResponse }>(
      '/api/v1/communication/conversations/',
      {
        method: 'POST',
        body: JSON.stringify({
          platform_conversation_id: params.platformConversationId,
          platform: params.platform || 'websocket',
          creator_id: params.creatorId,
          participants: params.participants,
          name: params.name,
          metadata: params.metadata,
        }),
      }
    );
    return response.data;
  }

  /**
   * Get conversation by ID
   */
  static async getConversation(conversationId: string): Promise<ConversationResponse> {
    const response = await this.fetch<{ data: ConversationResponse }>(
      `/api/v1/communication/conversations/${conversationId}`
    );
    return response.data;
  }

  /**
   * List conversations for a user
   */
  static async listConversations(params: {
    platform?: string;
    participantId?: string;
    limit?: number;
    offset?: number;
    includeArchived?: boolean;
  }): Promise<{ items: ConversationResponse[]; total: number; has_more: boolean }> {
    const queryParams = new URLSearchParams();
    if (params.platform) queryParams.set('platform', params.platform);
    if (params.participantId) queryParams.set('participant_id', params.participantId);
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.offset) queryParams.set('offset', params.offset.toString());
    if (params.includeArchived) queryParams.set('include_archived', 'true');

    const response = await this.fetch<{ data: { items: ConversationResponse[]; total: number; has_more: boolean } }>(
      `/api/v1/communication/conversations/?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Get message history for a conversation
   */
  static async getMessageHistory(
    conversationId: string,
    params?: {
      limit?: number;
      offset?: number;
      startDate?: string;
      endDate?: string;
      senderFilter?: string;
    }
  ): Promise<PaginatedMessagesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.set('limit', params.limit.toString());
    if (params?.offset) queryParams.set('offset', params.offset.toString());
    if (params?.startDate) queryParams.set('start_date', params.startDate);
    if (params?.endDate) queryParams.set('end_date', params.endDate);
    if (params?.senderFilter) queryParams.set('sender_filter', params.senderFilter);

    const response = await this.fetch<{ data: PaginatedMessagesResponse }>(
      `/api/v1/communication/messages/conversations/${conversationId}?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Mark messages as read
   */
  static async markMessagesRead(
    conversationId: string,
    userId: string
  ): Promise<{ success: boolean; message?: string }> {
    return this.fetch(`/api/v1/communication/messages/conversations/${conversationId}/mark-read`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  }

  /**
   * Archive conversation
   */
  static async archiveConversation(conversationId: string): Promise<{ success: boolean }> {
    return this.fetch(`/api/v1/communication/conversations/${conversationId}/archive`, {
      method: 'POST',
    });
  }

  /**
   * Get conversation summary
   */
  static async getConversationSummary(conversationId: string): Promise<{
    summary: string;
    key_points: string[];
    sentiment?: string;
  }> {
    const response = await this.fetch<{ data: any }>(
      `/api/v1/communication/conversations/${conversationId}/summary`
    );
    return response.data;
  }

  /**
   * Get conversation analytics
   */
  static async getConversationAnalytics(conversationId: string): Promise<{
    message_count: number;
    participant_stats: Record<string, any>;
    activity_timeline: any[];
  }> {
    const response = await this.fetch<{ data: any }>(
      `/api/v1/communication/conversations/${conversationId}/analytics`
    );
    return response.data;
  }
}
```

#### 5.1.2 Create Conversation Manager

**File**: `src/lib/conversations/conversation-manager.ts`

```typescript
import { UUID } from '../world-manager';
import { ConversationsAPI } from '../api/conversations-api';

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
        console.warn(`[ConversationManager] Stored conversation ${existingConvId} not found, creating new one`);
        localStorage.removeItem(storageKey);
      }
    }

    // Create new conversation
    console.log(`[ConversationManager] Creating new conversation for user ${userId} and agent ${agentId}`);
    const roomId = options?.roomId || agentId; // Use roomId or fallback to agentId

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
  }

  /**
   * List all conversations for a user
   */
  static async listUserConversations(userId: UUID): Promise<ConversationResponse[]> {
    const response = await ConversationsAPI.listConversations({
      participantId: userId,
      limit: 100,
      includeArchived: false,
    });
    return response.items;
  }

  private static getStorageKey(userId: UUID, agentId: UUID): string {
    return `${CONVERSATION_STORAGE_PREFIX}${userId}_${agentId}`;
  }
}
```

#### 5.1.3 Create Message History Manager

**File**: `src/lib/conversations/message-history-manager.ts`

```typescript
import { ConversationsAPI } from '../api/conversations-api';

export interface UIMessage {
  id: string;
  content: string | Record<string, any>;
  contentType: 'string' | 'json';
  isReceived: boolean;
  timestamp: number;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: Record<string, any>;
}

export class MessageHistoryManager {
  private messageCache = new Map<string, UIMessage[]>();
  private loadingState = new Map<string, boolean>();

  /**
   * Load message history for a conversation
   */
  async loadHistory(
    conversationId: string,
    agentId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<UIMessage[]> {
    const cacheKey = `${conversationId}_${options?.offset || 0}`;

    // Check cache first
    if (this.messageCache.has(cacheKey)) {
      console.log(`[MessageHistory] Returning cached messages for ${conversationId}`);
      return this.messageCache.get(cacheKey)!;
    }

    // Prevent duplicate requests
    if (this.loadingState.get(conversationId)) {
      console.log(`[MessageHistory] Already loading messages for ${conversationId}`);
      return [];
    }

    try {
      this.loadingState.set(conversationId, true);
      console.log(`[MessageHistory] Loading messages for conversation ${conversationId}`);

      const response = await ConversationsAPI.getMessageHistory(conversationId, {
        limit: options?.limit || 50,
        offset: options?.offset || 0,
      });

      console.log(`[MessageHistory] Loaded ${response.items.length} messages`);

      // Transform API messages to UI format
      const uiMessages = response.items.map((msg) =>
        this.transformMessageToUI(msg, agentId)
      );

      // Cache the messages
      this.messageCache.set(cacheKey, uiMessages);

      return uiMessages;
    } catch (error) {
      console.error(`[MessageHistory] Error loading messages:`, error);
      return [];
    } finally {
      this.loadingState.set(conversationId, false);
    }
  }

  /**
   * Transform API message to UI format
   */
  private transformMessageToUI(msg: MessageResponse, agentId: string): UIMessage {
    // Check if message contains structured content
    let content: string | Record<string, any> = msg.text;
    let contentType: 'string' | 'json' = 'string';

    // Try to parse JSON content
    if (
      msg.text.includes('service_details') ||
      msg.text.includes('agent_services') ||
      msg.text.includes('agent_list')
    ) {
      try {
        const cleanContent = msg.text.replace(/```json\n|\n```/g, '');
        const parsedContent = JSON.parse(cleanContent);
        if (parsedContent.type) {
          content = parsedContent;
          contentType = 'json';
        }
      } catch (e) {
        // Keep as string if parsing fails
      }
    }

    return {
      id: msg.id,
      content,
      contentType,
      isReceived: msg.sender_id.toLowerCase() === agentId.toLowerCase(),
      timestamp: new Date(msg.created_at).getTime(),
      status: msg.status as any,
      metadata: msg.metadata,
    };
  }

  /**
   * Clear cache for a conversation
   */
  clearCache(conversationId?: string): void {
    if (conversationId) {
      // Clear specific conversation cache
      const keysToDelete = Array.from(this.messageCache.keys()).filter((key) =>
        key.startsWith(conversationId)
      );
      keysToDelete.forEach((key) => this.messageCache.delete(key));
    } else {
      // Clear all cache
      this.messageCache.clear();
    }
  }

  /**
   * Prefetch next page of messages
   */
  async prefetchNextPage(conversationId: string, agentId: string, currentOffset: number): Promise<void> {
    const nextOffset = currentOffset + 50;
    await this.loadHistory(conversationId, agentId, { limit: 50, offset: nextOffset });
  }
}
```

### 5.2 Phase 2: Update Socket.IO Manager (Week 1-2)

#### 5.2.1 Enhance SocketIOManager

**File**: `src/lib/eliza/socket-io-manager-v0.tsx` (modifications)

```typescript
// Add new property
private conversationId: string | null = null;

/**
 * Initialize the Socket.io connection to the server
 * @param entityId The client entity ID
 * @param communicationURL The server URL
 * @param agentIds Array of agent IDs
 * @param namespace Optional namespace for the socket connection
 * @param conversationId Optional conversation ID for tracking
 */
public initialize(
  entityId: string,
  communicationURL: string,
  agentIds: string[],
  namespace: string = '/',
  conversationId?: string // NEW PARAMETER
): void {
  console.log('initializing socket', entityId, communicationURL, agentIds, namespace, conversationId);

  // Store conversation ID
  this.conversationId = conversationId || null;

  // ... rest of existing initialization code
}

/**
 * Send a message to a specific room with conversation tracking
 */
public async sendMessage(
  message: string,
  roomId: string,
  source: string,
  conversationId?: string // NEW PARAMETER
): Promise<void> {
  if (!this.socket) {
    console.error('[SocketIO] Cannot send message: socket not initialized');
    return;
  }

  // Wait for connection if needed
  if (!this.isConnected) {
    await this.connectPromise;
  }

  const messageId = randomUUID();
  const worldId = WorldManager.getWorldId();
  const convId = conversationId || this.conversationId;

  console.info(`[SocketIO] Sending message to room ${roomId}, conversation ${convId}`);

  // Emit message to server with conversation ID
  this.socket.emit('message', {
    type: SOCKET_MESSAGE_TYPE.SEND_MESSAGE,
    payload: {
      senderId: this.entityId,
      senderName: USER_NAME,
      message,
      roomId,
      channelId: roomId,
      serverId: "00000000-0000-0000-0000-000000000000",
      worldId,
      messageId,
      source,
      conversationId: convId, // Include conversation ID in payload
    },
  });

  // Immediately broadcast message locally
  this.emit('messageBroadcast', {
    senderId: this.entityId || '',
    senderName: USER_NAME,
    text: message,
    roomId,
    channelId: roomId,
    serverId: "00000000-0000-0000-0000-000000000000",
    createdAt: Date.now(),
    source,
    name: USER_NAME,
    conversationId: convId, // Include in local broadcast
  });
}

/**
 * Get the current conversation ID
 */
public getConversationId(): string | null {
  return this.conversationId;
}

/**
 * Set the conversation ID
 */
public setConversationId(conversationId: string): void {
  this.conversationId = conversationId;
}
```

### 5.3 Phase 3: Update WebsocketChat Component (Week 2)

#### 5.3.1 Integrate Conversation API

**File**: `src/components/chat/websocket-chat.tsx` (major modifications)

```typescript
import { ConversationManager } from "@/lib/conversations/conversation-manager";
import { MessageHistoryManager, UIMessage } from "@/lib/conversations/message-history-manager";
import { ConversationsAPI } from "@/lib/api/conversations-api";

export const WebsocketChat: FC<{
  agentId: `${string}-${string}-${string}-${string}-${string}`;
  communicationURL: string;
  elizaV1?: boolean;
  agentAddress?: string;
  namespace?: string;
}> = ({
  agentId,
  communicationURL,
  elizaV1,
  agentAddress,
  namespace = "/",
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [messageProcessing, setMessageProcessing] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null); // NEW
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false); // NEW
  const { authenticated, login } = usePrivy();
  const entityId = getEntityId();

  const messageHistoryManager = useMemo(() => new MessageHistoryManager(), []); // NEW

  // ... existing helper functions ...

  // NEW: Initialize conversation and load history
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        setIsInitializing(true);

        // Step 1: Determine room ID
        let channelId: string;
        if (elizaV1) {
          channelId = await createChannelForElizaV1(agentId, entityId);
        } else {
          channelId = WorldManager.generateRoomId(agentId);
        }
        setRoomId(channelId);

        // Step 2: Get or create conversation
        const { conversationId: convId, isNew } = await ConversationManager.getOrCreateConversation(
          entityId,
          agentId,
          {
            agentAddress,
            namespace,
            roomId: channelId,
          }
        );
        setConversationId(convId);
        console.log(`[WebsocketChat] Conversation initialized: ${convId} (new: ${isNew})`);

        // Step 3: Load message history if not a new conversation
        if (!isNew) {
          setIsLoadingHistory(true);
          try {
            const history = await messageHistoryManager.loadHistory(convId, agentId, {
              limit: 50,
              offset: 0,
            });
            if (history.length > 0) {
              setMessages(history);
              console.log(`[WebsocketChat] Loaded ${history.length} historical messages`);
            }
          } catch (error) {
            console.error('[WebsocketChat] Error loading message history:', error);
          } finally {
            setIsLoadingHistory(false);
          }
        }

        setIsInitializing(false);
      } catch (error) {
        console.error('[WebsocketChat] Error initializing conversation:', error);
        setIsInitializing(false);
      }
    };

    initializeConversation();
  }, [agentId, entityId, elizaV1, agentAddress, namespace]);

  // MODIFIED: Socket initialization with conversation ID
  useEffect(() => {
    if (!roomId || !conversationId) return;

    console.log('Initializing socket for namespace:', namespace, 'roomId:', roomId, 'conversationId:', conversationId);

    socketIOManager.initialize(
      entityId,
      communicationURL || process.env.NEXT_PUBLIC_SOCKET_URL!,
      [agentId],
      namespace,
      conversationId // Pass conversation ID
    );

    socketIOManager.joinRoom(roomId);

    console.log("joined room", roomId);

    // Remove sessionStorage logic - we now use persistent conversation history

    const handleMessageBroadcasting = (data: any) => {
      console.log("message received", data, agentId);

      if (!data) {
        console.warn("No data received", data);
        return;
      }

      const contentData = data as Content;
      if (extractChannelId(contentData) !== roomId) {
        console.warn("Message received from a different room", data);
        return;
      }

      const formattedMessage = formatMessage(contentData);
      if (formattedMessage) {
        setMessages((prev) => [...prev, formattedMessage]);
      }
    };

    const handleMessageComplete = (data: any) => {
      const contentData = data as Content;
      if (extractChannelId(contentData) === roomId) {
        setMessageProcessing(false);
        // Update status of pending messages to 'sent'
        setMessages((prev) =>
          prev.map((msg) =>
            msg.status === "sending" ? { ...msg, status: "sent" } : msg
          )
        );

        // NEW: Mark messages as read
        if (conversationId) {
          ConversationsAPI.markMessagesRead(conversationId, entityId).catch((error) => {
            console.error('[WebsocketChat] Error marking messages as read:', error);
          });
        }
      }
    };

    socketIOManager.on("messageBroadcast", handleMessageBroadcasting);
    socketIOManager.on("messageComplete", handleMessageComplete);

    return () => {
      console.log('Cleaning up socket for roomId:', roomId, 'namespace:', namespace);
      socketIOManager.leaveRoom(roomId);
      socketIOManager.off("messageBroadcast", handleMessageBroadcasting);
      socketIOManager.off("messageComplete", handleMessageComplete);
    };
  }, [roomId, conversationId, agentId, entityId, socketIOManager, namespace]);

  // MODIFIED: Send message with conversation ID
  const handleSend = useCallback(() => {
    if (!input || messageProcessing || !roomId || !conversationId) return;

    socketIOManager.sendMessage(input, roomId, CHAT_SOURCE, conversationId);

    setMessageProcessing(true);
    setInput("");
  }, [roomId, conversationId, entityId, input, socketIOManager, messageProcessing]);

  const handleTaskSend = useCallback(
    (msg: string) => {
      if (!roomId || !conversationId) return;

      socketIOManager.sendMessage(msg, roomId, CHAT_SOURCE, conversationId);

      setMessageProcessing(true);
    },
    [roomId, conversationId, socketIOManager]
  );

  // NEW: Load more messages (infinite scroll)
  const handleLoadMore = useCallback(async () => {
    if (!conversationId || isLoadingHistory) return;

    setIsLoadingHistory(true);
    try {
      const currentOffset = messages.length;
      const olderMessages = await messageHistoryManager.loadHistory(conversationId, agentId, {
        limit: 50,
        offset: currentOffset,
      });

      if (olderMessages.length > 0) {
        setMessages((prev) => [...olderMessages, ...prev]);
      }
    } catch (error) {
      console.error('[WebsocketChat] Error loading more messages:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [conversationId, messages.length, isLoadingHistory, agentId]);

  return (
    <ChatLayout
      agentId={agentId}
      messages={messages}
      handleSend={authenticated ? () => handleSend() : () => login()}
      handleTaskSend={
        authenticated ? (msg: string) => handleTaskSend(msg) : () => login()
      }
      setInput={setInput}
      input={input}
      messageProcessing={messageProcessing}
      agentAddress={agentAddress}
      initializing={isInitializing || isLoadingHistory} // Include history loading
      roomId={roomId || ""}
      conversationId={conversationId || ""} // NEW: Pass to chat layout
      onLoadMore={handleLoadMore} // NEW: Infinite scroll handler
    />
  );
};
```

### 5.4 Phase 4: Add TypeScript Types (Week 2)

**File**: `src/types/conversations.ts`

```typescript
export type PlatformType = "websocket" | "telegram" | "discord" | "x" | "whatsapp";
export type SenderType = "user" | "agent" | "system";
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface CreateConversationRequest {
  platform_conversation_id: string;
  conversation_id?: string | null;
  name?: string | null;
  platform?: PlatformType;
  creator_id?: string | null;
  participants?: string[] | null;
  metadata?: Record<string, any> | null;
}

export interface ConversationResponse {
  id: string;
  name?: string | null;
  description?: string | null;
  platform: PlatformType;
  platform_conversation_id: string;
  platform_metadata: Record<string, any>;
  participants: string[];
  created_by?: string | null;
  message_count: number;
  last_message_at?: string | null;
  is_active: boolean;
  archived_at?: string | null;
  metadata: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface PlatformContextResponse {
  platform: PlatformType;
  room_id?: string | null;
  channel_id?: string | null;
  thread_id?: string | null;
  server_id?: string | null;
  metadata: Record<string, any>;
}

export interface AttachmentResponse {
  id: string;
  type: string;
  url: string;
  filename?: string;
  size?: number;
  metadata?: Record<string, any>;
}

export interface MessageResponse {
  id: string;
  conversation_id: string;
  platform_context: PlatformContextResponse;
  text: string;
  attachments: AttachmentResponse[];
  sender_id: string;
  sender_name: string;
  sender_type: SenderType;
  status: MessageStatus;
  metadata: Record<string, any>;
  thread_id?: string | null;
  reaction_count: number;
  is_edited: boolean;
  edit_history: Record<string, any>[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface PaginatedMessagesResponse {
  items: MessageResponse[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ConversationOperationResponse {
  success: boolean;
  conversation_id?: string | null;
  message?: string | null;
}
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

**ConversationsAPI Tests** (`src/lib/api/conversations-api.test.ts`)
- Test conversation creation with valid/invalid parameters
- Test message history fetching with pagination
- Test error handling (network failures, 4xx/5xx responses)
- Test request/response transformations

**ConversationManager Tests** (`src/lib/conversations/conversation-manager.test.ts`)
- Test getOrCreateConversation flow
- Test localStorage key generation
- Test conversation ID caching and retrieval
- Test clearing conversation data

**MessageHistoryManager Tests** (`src/lib/conversations/message-history-manager.test.ts`)
- Test message transformation from API to UI format
- Test caching logic (hits/misses)
- Test pagination handling
- Test JSON message parsing

### 6.2 Integration Tests

**Conversation Flow Tests**
- Create conversation → verify stored in localStorage
- Send message → verify it appears in UI
- Reload page → verify conversation loads correctly
- Load message history → verify proper pagination

**Socket Integration Tests**
- Initialize socket with conversation ID
- Send message with conversation tracking
- Verify conversation ID included in socket payloads
- Test mark-as-read functionality

### 6.3 End-to-End Tests

**Full User Journey** (`e2e/conversation-flow.spec.ts`)

```typescript
test('User can create conversation and persist messages', async ({ page }) => {
  // 1. Navigate to agent chat
  await page.goto('/agents/[agent-id]/chat');

  // 2. Wait for conversation initialization
  await page.waitForSelector('[data-testid="chat-input"]');

  // 3. Send a message
  await page.fill('[data-testid="chat-input"]', 'Hello agent!');
  await page.click('[data-testid="send-button"]');

  // 4. Wait for agent response
  await page.waitForSelector('[data-testid="agent-message"]');

  // 5. Verify localStorage has conversation ID
  const conversationId = await page.evaluate(() => {
    const userId = localStorage.getItem('elizaos-client-user-id');
    const agentId = '[agent-id]';
    return localStorage.getItem(`conv_${userId}_${agentId}`);
  });
  expect(conversationId).toBeTruthy();

  // 6. Reload page
  await page.reload();

  // 7. Verify message history loads
  await page.waitForSelector('[data-testid="message-history-loaded"]');
  const messages = await page.$$('[data-testid="chat-message"]');
  expect(messages.length).toBeGreaterThan(0);

  // 8. Verify message content persisted
  const firstMessage = await messages[0].textContent();
  expect(firstMessage).toContain('Hello agent!');
});

test('User can load older messages with infinite scroll', async ({ page }) => {
  // ... test infinite scroll pagination
});

test('Multiple devices can sync conversation', async ({ browser }) => {
  // ... test multi-device sync
});
```

### 6.4 Error Handling Tests

**API Failure Scenarios**
- Network timeout during conversation creation
- 404 when fetching non-existent conversation
- 429 rate limiting responses
- 500 server errors

**Recovery Tests**
- Retry logic for transient failures
- Graceful degradation when API unavailable
- Clear error messages for users

---

## 7. Security Considerations

### 7.1 Authentication

**Bearer Token Implementation**

```typescript
// src/lib/api/conversations-api.ts
import { getAuthToken } from '@/lib/auth'; // Implement based on your auth system

private static async fetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = await getAuthToken(); // Get token from Privy or your auth provider

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    // Redirect to login or refresh token
    throw new Error('Unauthorized - please log in again');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
```

### 7.2 Authorization

**Participant Validation**
- Backend validates user is participant before returning conversation data
- Frontend checks participant list before displaying conversation
- Implement role-based permissions (owner, participant, viewer)

**Access Control Checks**

```typescript
// src/lib/conversations/conversation-manager.ts
export class ConversationManager {
  static async validateAccess(
    conversationId: string,
    userId: UUID
  ): Promise<boolean> {
    try {
      const conversation = await ConversationsAPI.getConversation(conversationId);
      return conversation.participants.includes(userId);
    } catch (error) {
      console.error('Access validation failed:', error);
      return false;
    }
  }

  static async getOrCreateConversation(
    userId: UUID,
    agentId: UUID,
    options?: { /* ... */ }
  ): Promise<{ conversationId: string; isNew: boolean }> {
    const storageKey = this.getStorageKey(userId, agentId);
    const existingConvId = localStorage.getItem(storageKey);

    if (existingConvId) {
      // Validate user still has access
      const hasAccess = await this.validateAccess(existingConvId, userId);
      if (hasAccess) {
        return { conversationId: existingConvId, isNew: false };
      } else {
        // Remove stale conversation ID
        localStorage.removeItem(storageKey);
      }
    }

    // Create new conversation...
  }
}
```

### 7.3 Data Privacy

**LocalStorage Best Practices**
- Store only non-sensitive identifiers (conversation IDs, user IDs)
- Never store message content in localStorage
- Clear localStorage on logout

**Data Retention**

```typescript
// src/lib/conversations/conversation-manager.ts
export class ConversationManager {
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
}
```

**GDPR Compliance**
- Provide API endpoint to delete all user conversations
- Implement data export functionality
- Add consent management for conversation storage

### 7.4 Rate Limiting & Performance

**Client-Side Request Throttling**

```typescript
// src/lib/api/conversations-api.ts
import { throttle } from 'lodash';

export class ConversationsAPI {
  // Throttle mark-as-read requests to max 1 per 5 seconds
  static markMessagesRead = throttle(
    async (conversationId: string, userId: string) => {
      return this.fetch(
        `/api/v1/communication/messages/conversations/${conversationId}/mark-read`,
        {
          method: 'POST',
          body: JSON.stringify({ user_id: userId }),
        }
      );
    },
    5000,
    { leading: true, trailing: false }
  );

  // Cache conversation details for 5 minutes
  private static conversationCache = new Map<string, {
    data: ConversationResponse;
    timestamp: number;
  }>();

  static async getConversation(conversationId: string): Promise<ConversationResponse> {
    const cached = this.conversationCache.get(conversationId);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < 5 * 60 * 1000) {
      console.log(`[API] Using cached conversation: ${conversationId}`);
      return cached.data;
    }

    const data = await this.fetch<{ data: ConversationResponse }>(
      `/api/v1/communication/conversations/${conversationId}`
    );

    this.conversationCache.set(conversationId, {
      data: data.data,
      timestamp: now,
    });

    return data.data;
  }
}
```

**Exponential Backoff for Retries**

```typescript
// src/lib/api/retry-helper.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('4')) {
        throw error;
      }

      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

### 7.5 Input Validation & Sanitization

**Message Content Validation**

```typescript
// src/lib/validation/message-validation.ts
export function validateMessageContent(content: string): {
  isValid: boolean;
  error?: string;
} {
  // Max message length
  if (content.length > 10000) {
    return { isValid: false, error: 'Message too long (max 10,000 characters)' };
  }

  // Minimum length
  if (content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  // Check for malicious content (basic XSS prevention)
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick=
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      return { isValid: false, error: 'Message contains invalid content' };
    }
  }

  return { isValid: true };
}
```

---

## 8. Future Enhancements

### 8.1 Phase 5: Advanced Features

1. **Conversation Search**
   - Full-text search across messages
   - Filter by date, participant, tags

2. **Conversation Summaries**
   - AI-generated summaries via `/api/v1/communication/conversations/{id}/summary`
   - Display in conversation list

3. **Analytics Dashboard**
   - Use `/api/v1/communication/conversations/{id}/analytics`
   - Show message frequency, response times, sentiment

4. **Multi-Device Sync**
   - WebSocket events for cross-device updates
   - Real-time conversation list updates

5. **Conversation Templates**
   - Pre-defined conversation types (support, sales, etc.)
   - Custom metadata schemas per template

### 8.2 Phase 6: Performance Optimizations

1. **Virtual Scrolling**
   - Render only visible messages for long conversations
   - Use libraries like `react-window` or `react-virtualized`

2. **Message Prefetching**
   - Preload next page of messages on scroll
   - Implement in MessageHistoryManager

3. **Optimistic Updates**
   - Update UI immediately before API confirmation
   - Rollback on error

4. **Service Worker Caching**
   - Cache conversation data offline
   - Sync when connection restored

---

## 9. Success Metrics

### 9.1 Technical Metrics

- Message history load time < 500ms
- Conversation creation time < 300ms
- API error rate < 1%
- Cache hit rate > 80%

### 9.2 User Experience Metrics

- 100% message persistence (no lost messages)
- Conversation continuity across sessions
- < 2 second time to first message display

### 9.3 Monitoring

- Log conversation creation/retrieval times
- Track API response times and error rates
- Monitor localStorage usage
- Alert on abnormal error patterns

---

## 10. Implementation Checklist

### Week 1: Core Infrastructure
- [ ] Create `src/types/conversations.ts` with all TypeScript interfaces
- [ ] Create `src/lib/api/conversations-api.ts` service layer
  - [ ] Implement `createConversation` method
  - [ ] Implement `getConversation` method
  - [ ] Implement `listConversations` method
  - [ ] Implement `getMessageHistory` method
  - [ ] Implement `markMessagesRead` method
  - [ ] Add authentication headers (Bearer token)
  - [ ] Add caching mechanism
- [ ] Create `src/lib/conversations/conversation-manager.ts`
  - [ ] Implement `getOrCreateConversation` logic
  - [ ] Implement localStorage persistence
  - [ ] Implement access validation
  - [ ] Add cleanup methods
- [ ] Create `src/lib/conversations/message-history-manager.ts`
  - [ ] Implement message loading with caching
  - [ ] Implement API-to-UI transformation
  - [ ] Add pagination support
  - [ ] Implement prefetching
- [ ] Create `src/lib/api/retry-helper.ts` with exponential backoff
- [ ] Create `src/lib/validation/message-validation.ts` for input validation
- [ ] Write unit tests for all new modules

### Week 2: Integration
- [ ] Update `src/lib/eliza/socket-io-manager-v0.tsx`
  - [ ] Add `conversationId` property
  - [ ] Update `initialize()` to accept `conversationId`
  - [ ] Update `sendMessage()` to include `conversationId` in payload
  - [ ] Add getters/setters for conversation ID
- [ ] Update `src/components/chat/websocket-chat.tsx`
  - [ ] Add `conversationId` state
  - [ ] Add `isLoadingHistory` state
  - [ ] Implement conversation initialization on mount
  - [ ] Integrate `ConversationManager.getOrCreateConversation()`
  - [ ] Integrate `MessageHistoryManager.loadHistory()`
  - [ ] Update message sending to include conversation ID
  - [ ] Implement automatic mark-as-read on message receive
  - [ ] Add infinite scroll handler for loading older messages
  - [ ] Update `ChatLayout` props to include conversation ID
- [ ] Remove sessionStorage logic (replace with persistent history)
- [ ] Add loading states and error handling throughout

### Week 3: Testing & Polish
- [ ] Write unit tests
  - [ ] `conversations-api.test.ts` (API methods, error handling)
  - [ ] `conversation-manager.test.ts` (localStorage, caching)
  - [ ] `message-history-manager.test.ts` (transformations, pagination)
  - [ ] `retry-helper.test.ts` (backoff logic)
  - [ ] `message-validation.test.ts` (validation rules)
- [ ] Write integration tests
  - [ ] Conversation creation flow
  - [ ] Message history loading
  - [ ] Socket.IO integration with conversation tracking
  - [ ] Mark-as-read functionality
- [ ] Write E2E tests (Playwright/Cypress)
  - [ ] Full conversation lifecycle
  - [ ] Page reload persistence
  - [ ] Infinite scroll pagination
  - [ ] Error scenarios (network failures, etc.)
- [ ] Performance testing
  - [ ] Measure conversation creation time
  - [ ] Measure message history load time
  - [ ] Test with large message counts (1000+ messages)
  - [ ] Verify cache hit rates
- [ ] Security review
  - [ ] Verify authentication implementation
  - [ ] Test authorization checks
  - [ ] Review input validation
  - [ ] Test rate limiting

### Week 4: Deployment & Monitoring
- [ ] Code review and documentation
  - [ ] Add JSDoc comments to all public methods
  - [ ] Update README with new features
  - [ ] Create architecture diagrams
- [ ] Staging deployment
  - [ ] Deploy to staging environment
  - [ ] Run full test suite
  - [ ] Manual QA testing
  - [ ] Performance benchmarking
- [ ] Production deployment
  - [ ] Deploy backend API changes (if any)
  - [ ] Deploy frontend changes
  - [ ] Monitor error rates
  - [ ] Monitor API response times
  - [ ] Monitor conversation creation success rate
- [ ] Post-deployment
  - [ ] Set up alerts for error spikes
  - [ ] Monitor localStorage usage across users
  - [ ] Track conversation history load times
  - [ ] Collect user feedback
  - [ ] Plan Phase 5 features based on usage patterns

---

## 11. Appendix

### 11.1 API Endpoint Quick Reference

| Endpoint | Method | Purpose | Key Parameters |
|----------|--------|---------|----------------|
| `/api/v1/communication/conversations/` | POST | Create conversation | `platform_conversation_id`, `participants` |
| `/api/v1/communication/conversations/` | GET | List conversations | `participant_id`, `limit`, `offset` |
| `/api/v1/communication/conversations/{id}` | GET | Get details | - |
| `/api/v1/communication/messages/conversations/{id}` | GET | Get history | `limit`, `offset`, `start_date` |
| `/api/v1/communication/messages/conversations/{id}/mark-read` | POST | Mark read | `user_id` |

### 11.2 localStorage Keys

- `conv_{userId}_{agentId}` - Stores conversation ID for user-agent pair
- `elizaos-client-user-id` - Stores user's entity ID
- `elizaos-world-id` - Stores world ID

### 11.3 Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| 404 - Conversation not found | Stale conversation ID | Clear localStorage and create new conversation |
| 403 - Forbidden | User not participant | Re-authenticate or request access |
| 429 - Rate limit | Too many requests | Implement exponential backoff with retry |
| 500 - Server error | Backend issue | Retry with exponential backoff |

---

## Conclusion

This specification provides a comprehensive roadmap for integrating the Conversations API into the websocket chat system from the ground up. The implementation enables:

- **Persistent conversation history** across sessions and devices
- **Full conversation lifecycle management** with metadata and analytics
- **Scalable architecture** with caching, pagination, and performance optimization
- **Enterprise-grade security** with authentication, authorization, and input validation
- **Robust error handling** with retries and graceful degradation

The 4-week implementation plan provides detailed tasks, complete code examples, and testing strategies to ensure a successful rollout.

**Next Steps:**
1. Review and approve this specification
2. Set up project timeline and assign development tasks
3. Begin Week 1: Core Infrastructure implementation
4. Schedule weekly check-ins to track progress and address blockers

**Pre-Implementation Validation:**
- Confirm backend API is stable and available at `http://localhost:8000` (production: TBD)
- Verify authentication mechanism (Privy tokens) work with API endpoints
- Test API endpoints manually using Swagger docs at `/docs`
- Confirm database can handle expected message volume
- Set up monitoring and alerting infrastructure

**Success Criteria:**
- All conversation history persists across page reloads
- Message load time < 500ms for 50 messages
- Conversation creation time < 300ms
- Zero message loss
- API error rate < 1%
