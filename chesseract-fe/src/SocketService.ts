import { io, Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../config/env';

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  // Singleton pattern
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Initialize connection
  public connect(token?: string): void {
    if (this.socket) return;

    // Connect to your backend server
    this.socket = io(SOCKET_BASE_URL, {
      withCredentials: true,
      auth: token ? { token } : undefined
    });

    // Setup connection event handlers
    this.socket.on('connect', () => {
      console.log('Connected to server', this.socket?.id);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
    });
  }

  // Disconnect from server
  public disconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  // Emit event to server
  public emit(event: string, data: any): void {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  // Listen for events
  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  // Stop listening to an event
  public off(event: string): void {
    if (!this.socket) return;
    this.socket.off(event);
  }

  // Join a room (game room, etc.)
  public joinGame(gameId: string, userId: string): void {
    this.emit('join_game', { gameId, userId });
  }

  // Find a match
  public findMatch(userData: {
    userId: string, 
    username: string,
    profilePicture: string,
    rating: number,
    timeControl: { initial: number, increment: number }
  }): void {
    this.emit('find_match', userData);
  }

  // Make a move in a game
  public makeMove(gameId: string, userId: string, move: { from: string, to: string }, fen?: string): void {
    this.emit('make_move', { gameId, userId, move, fen });
  }

  // Send chat message
  public sendGameMessage(gameId: string, userId: string, username: string, message: string): void {
    this.emit('game_message', { gameId, userId, username, message });
  }

  // Get socket id
  public getSocketId(): string | null {
    return this.socket?.id ?? null;
  }

  // Check if connected
  public isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default SocketService.getInstance();