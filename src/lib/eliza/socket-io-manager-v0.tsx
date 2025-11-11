'use client'
import { Evt } from "evt";
import { io, Socket } from "socket.io-client";
import { randomUUID, WorldManager } from "../world-manager";
import { USER_NAME } from "@/constants";

enum SOCKET_MESSAGE_TYPE {
  ROOM_JOINING = 1,
  SEND_MESSAGE = 2,
  MESSAGE = 3,
  ACK = 4,
  THINKING = 5
}

export type MessageBroadcastData = {
    senderId: string;
    senderName: string;
    text: string;
    roomId: string;
    channelId: string;
    serverId: string;
    createdAt: number;
    source: string;
    name: string; // Required for ContentWithUser compatibility
    [key: string]: any;
  };
  
  export type MessageCompleteData = {
    roomId: string;
    [key: string]: any;
  };
  
  // A simple class that provides EventEmitter-like interface using Evt internally
  class EventAdapter {
    private events: Record<string, Evt<any>> = {};
  
    constructor() {
      // Initialize common events
      this.events.messageBroadcast = Evt.create<MessageBroadcastData>();
      this.events.messageComplete = Evt.create<MessageCompleteData>();
    }
  
    on(eventName: string, listener: (...args: any[]) => void) {
      if (!this.events[eventName]) {
        this.events[eventName] = Evt.create();
      }
  
      this.events[eventName].attach(listener);
      return this;
    }
  
    off(eventName: string, listener: (...args: any[]) => void) {
      if (this.events[eventName]) {
        const handlers = this.events[eventName].getHandlers();
        for (const handler of handlers) {
          if (handler.callback === listener) {
            handler.detach();
          }
        }
      }
      return this;
    }
  
    emit(eventName: string, ...args: any[]) {
      if (this.events[eventName]) {
        this.events[eventName].post(args.length === 1 ? args[0] : args);
      }
      return this;
    }
  
    once(eventName: string, listener: (...args: any[]) => void) {
      if (!this.events[eventName]) {
        this.events[eventName] = Evt.create();
      }
  
      this.events[eventName].attachOnce(listener);
      return this;
    }
  
    // For checking if EventEmitter has listeners
    listenerCount(eventName: string): number {
      if (!this.events[eventName]) return 0;
      return this.events[eventName].getHandlers().length;
    }
  
    // Used only for internal access to the Evt instances
    _getEvt(eventName: string): Evt<any> | undefined {
      return this.events[eventName];
    }
  }
  
  /**
   * SocketIOManager handles real-time communication between the client and server
   * using Socket.io. It maintains a single connection to the server and allows
   * joining and messaging in multiple rooms.
   */
  class SocketIOManager extends EventAdapter {
    private static instance: SocketIOManager | null = null;
    private socket: Socket | null = null;
    private isConnected = false;
    private connectPromise: Promise<void> | null = null;
    private resolveConnect: (() => void) | null = null;
    private activeRooms: Set<string> = new Set();
    private entityId: string | null = null;
    private agentIds: string[] | null = null;
    private namespace: string = '/';
    private conversationId: string | null = null;
  
    // Public accessor for EVT instances (for advanced usage)
    public get evtMessageBroadcast() {
      return this._getEvt('messageBroadcast') as Evt<MessageBroadcastData>;
    }
  
    public get evtMessageComplete() {
      return this._getEvt('messageComplete') as Evt<MessageCompleteData>;
    }
  
    private constructor() {
      super();
    }
  
    public static getInstance(): SocketIOManager {
      if (!SocketIOManager.instance) {
        SocketIOManager.instance = new SocketIOManager();
      }
      return SocketIOManager.instance;
    }
  
    /**
     * Initialize the Socket.io connection to the server
     * @param entityId The client entity ID
     * @param communicationURL The server URL
     * @param agentIds Array of agent IDs
     * @param namespace Optional namespace for the socket connection (e.g., '/fuse-faq')
     * @param conversationId Optional conversation ID for tracking
     */
    public initialize(entityId: string, communicationURL: string, agentIds: string[], namespace: string = '/', conversationId?: string): void {
      console.log('initializing socket', entityId, communicationURL, agentIds, namespace, conversationId);

      // Check if we need to reinitialize due to namespace change
      if (this.socket && this.namespace !== namespace) {
        console.info('[SocketIO] Namespace changed, disconnecting and reinitializing', this.namespace, '->', namespace);
        this.disconnect();
      }

      this.entityId = entityId;
      this.agentIds = agentIds;
      this.namespace = namespace;
      this.conversationId = conversationId || null;

      if (this.socket) {
        console.warn('[SocketIO] Socket already initialized for namespace:', namespace);
        return;
      }
  
      // Create a single socket connection with namespace support
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://intern-api-staging.ensemble.codes';
      const baseURL = `${apiBaseUrl}${namespace}`;
      const fullURL = baseURL;
      console.info('connecting to', fullURL, 'with namespace:', namespace);


      this.socket = io(fullURL, {
        autoConnect: true,
        reconnection: true,
        extraHeaders: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
  
      // Set up connection promise for async operations that depend on connection
      this.connectPromise = new Promise<void>((resolve) => {
        this.resolveConnect = resolve;
      });
  
      this.socket.on('connect', () => {
        console.info('[SocketIO] Connected to server');
        this.isConnected = true;
        this.resolveConnect?.();
  
        // Rejoin any active rooms after reconnection
        this.activeRooms.forEach((roomId) => {
          this.joinRoom(roomId);
        });
      });
  
      this.socket.on('messageBroadcast', (data) => {
        console.info(`[SocketIO] Message broadcast received:`, data);
  
        // Log the full data structure to understand formats
        console.debug('[SocketIO] Message broadcast data structure:', {
          keys: Object.keys(data),
          senderId: data.senderId,
          senderNameType: typeof data.senderName,
          textType: typeof data.text,
          textLength: data.text ? data.text.length : 0,
          hasThought: 'thought' in data,
          hasActions: 'actions' in data,
          additionalKeys: Object.keys(data).filter(
            (k) =>
              ![
                'senderId',
                'senderName',
                'text',
                'roomId',
                'createdAt',
                'source',
                'thought',
                'actions',
              ].includes(k)
          ),
        });
  
        // Check if this is a message for one of our active rooms
        if (this.activeRooms.has(data.roomId)) {
          console.info(`[SocketIO] Handling message for active room ${data.roomId}`);
          // Post the message to the event
          this.emit('messageBroadcast', {
            ...data,
            name: data.senderName, // Required for ContentWithUser compatibility
          });
  
          if (this.socket) {
            this.socket.emit('message', {
              type: SOCKET_MESSAGE_TYPE.SEND_MESSAGE,
              payload: {
                senderId: data.senderId,
                senderName: data.senderName,
                message: data.text,
                roomId: data.roomId,
                worldId: WorldManager.getWorldId(),
                source: data.source,
              },
            });
          }
        } else {
          console.warn(
            `[SocketIO] Received message for inactive room ${data.roomId}, active rooms:`,
            Array.from(this.activeRooms)
          );
        }
      });
  
      this.socket.on('messageComplete', (data) => {
        this.emit('messageComplete', data);
      });
  
      this.socket.on('disconnect', (reason) => {
        console.info(`[SocketIO] Disconnected. Reason: ${reason}`);
        this.isConnected = false;
  
        // Reset connect promise for next connection
        this.connectPromise = new Promise<void>((resolve) => {
          this.resolveConnect = resolve;
        });
  
        if (reason === 'io server disconnect') {
          this.socket?.connect();
        }
      });
  
      this.socket.on('connect_error', (error) => {
        console.error('[SocketIO] Connection error:', error);
      });
    }
  
    /**
     * Join a room to receive messages from it
     * NOTE: This now uses platform_conversation_id instead of roomId
     * @param roomId Room/Agent ID to join (will be sent as platform_conversation_id)
     */
    public async joinRoom(roomId: string): Promise<void> {
      if (!this.socket) {
        console.error('[SocketIO] Cannot join room: socket not initialized');
        return;
      }

      // Wait for connection if needed
      if (!this.isConnected) {
        await this.connectPromise;
      }

      this.activeRooms.add(roomId);

      // BREAKING CHANGE: Use 'join' event with platform_conversation_id
      this.socket.emit('join', {
        platform_conversation_id: roomId,
        userId: this.entityId,
      });

      console.info(`[SocketIO] Joined conversation with platform_conversation_id: ${roomId}`);
    }
  
    /**
     * Leave a room to stop receiving messages from it
     * @param roomId Room/Agent ID to leave
     */
    public leaveRoom(roomId: string): void {
      if (!this.socket || !this.isConnected) {
        console.warn(`[SocketIO] Cannot leave room ${roomId}: not connected`);
        return;
      }
  
      this.activeRooms.delete(roomId);
      console.info(`[SocketIO] Left room ${roomId}`);
    }
  
    /**
     * Send a message to a specific room with conversation tracking
     * NOTE: This now uses 'chat_message' event with platform_conversation_id
     * @param message Message text to send
     * @param roomId Room/Agent ID (platform_conversation_id) to send the message to
     * @param source Source identifier (e.g., 'client_chat')
     * @param conversationId Optional conversation ID for tracking
     */
    public async sendMessage(message: string, roomId: string, source: string, conversationId?: string): Promise<void> {
      if (!this.socket) {
        console.error('[SocketIO] Cannot send message: socket not initialized');
        return;
      }

      // Wait for connection if needed
      if (!this.isConnected) {
        await this.connectPromise;
      }

      const messageId = randomUUID();
      const convId = conversationId || this.conversationId;

      console.info(`[SocketIO] Sending message with platform_conversation_id: ${roomId}, conversation: ${convId}`);

      // BREAKING CHANGE: Use 'chat_message' event with platform_conversation_id
      this.socket.emit('chat_message', {
        message,
        platform_conversation_id: roomId,
        senderId: this.entityId,
        senderName: USER_NAME,
        messageId,
        source,
        conversationId: convId,
      });

      // Immediately broadcast message locally so UI updates instantly
      this.emit('messageBroadcast', {
        senderId: this.entityId || '',
        senderName: USER_NAME,
        text: message,
        roomId,
        channelId: roomId,
        serverId: "00000000-0000-0000-0000-000000000000",
        createdAt: Date.now(),
        source,
        name: USER_NAME, // Required for ContentWithUser compatibility
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
      console.info(`[SocketIO] Conversation ID set to: ${conversationId}`);
    }

    /**
     * Disconnect from the server
     */
    public disconnect(): void {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
        this.isConnected = false;
        this.activeRooms.clear();
        console.info('[SocketIO] Disconnected from server');
      }
    }
  }

  export default SocketIOManager;
