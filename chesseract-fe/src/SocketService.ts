import { io, Socket } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../config/env';
import { TimeFormats } from './models/GameUtilityTypes';

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

  // Find a match
  public findMatch(userData: {
    userId: string, 
    username: string,
    profilePicture: string,
    rating: number,
    timeControl: { initial: number, increment: number }
    timeFormat: TimeFormats
  }): void {
    this.emit('find_match', userData);
  }

  // Join a game
  public joinGame(gameId: string, userId: string): void {
    if (!this.socket) return;
    this.socket.emit('join_game', { gameId, userId });
  }

  // Make a move in a game
  public makeMove(gameId: string, move: { from: string, to: string, promotion?: string }, fen: string): void {
    if (!this.socket) return;
    this.socket.emit('move', { gameId, move, fen });
  }

  // Report game over
  public reportGameOver(gameId: string, winner: 'white' | 'black' | 'draw', reason: string, fen: string, pgn: string): void {
    if (!this.socket) return;
    this.socket.emit('game_over', { gameId, winner, reason, fen, pgn });
  }

  // Resign from a game
  public resignGame(gameId: string, userId: string, color: 'white' | 'black'): void {
    if (!this.socket) return;
    this.socket.emit('resign', { gameId, userId, color });
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