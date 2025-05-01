import { Server, Socket } from "socket.io";
import Game from "../../models/game.model.ts";

// Track which players are in which games
const playerGameMap = new Map<string, string>(); // socketId -> gameId

export default function registerGameEvents(io: Server, socket: Socket): void {
  // Join a specific game room
  socket.on("join_game", async (data: { 
    gameId: string, 
    userId: string 
  }) => {
    const { gameId, userId } = data;
    
    try {
      // Check if game exists
      const game = await Game.findById(gameId);
      
      if (!game) {
        socket.emit("game_error", { message: "Game not found" });
        return;
      }
      
      // Join the game room
      socket.join(gameId);
      playerGameMap.set(socket.id, gameId);
      
      console.log(`User ${userId} (${socket.id}) joined game ${gameId}`);
      
      // Notify the room that player has joined
      socket.to(gameId).emit("opponent_joined", { userId });
      
      // Tell the joining player if their opponent is already in the room
      const roomInfo = io.sockets.adapter.rooms.get(gameId);
      if (roomInfo && roomInfo.size > 1) {
        socket.emit("opponent_present", true);
      } else {
        socket.emit("opponent_present", false);
      }
      
    } catch (error) {
      console.error("Error joining game:", error);
      socket.emit("game_error", { message: "Failed to join game" });
    }
  });

  // Handle game moves (just relay to opponent)
  socket.on("move", (data: {
    gameId: string,
    move: { from: string, to: string, promotion?: string },
    fen?: string
  }) => {
    const { gameId } = data;
    
    // Relay move to the opponent
    socket.to(gameId).emit("opponent_move", data);
    
    console.log(`Move in game ${gameId}: ${data.move.from} to ${data.move.to}`);
  });
  
  // Handle game over event - winner reports the result
  socket.on("game_over", async (data: {
    gameId: string,
    userId: string, // Winner/reporter ID
    winner: 'white' | 'black' | 'draw',
    reason: string,
    moves?: string[],
    fen?: string,
    pgn?: string
  }) => {
    const { gameId, userId, winner, reason, moves, fen, pgn } = data;
    
    console.log(`Game over reported for ${gameId} by ${userId}: ${winner} wins by ${reason}`);
    
    try {
      // Update the game in the database
      await Game.findByIdAndUpdate(gameId, {
        status: 'finished',
        winner,
        resultReason: reason,
        moves: moves || [],
        fen,
        pgn
      });
      
      // Broadcast game result to all players in the room
      socket.to(gameId).emit("game_ended", { winner, reason });
      
    } catch (error) {
      console.error("Error saving game result:", error);
      socket.emit("game_error", { message: "Failed to save game result" });
    }
  });

  // Handle resignation
  socket.on("resign", async (data: { gameId: string, userId: string, color: 'white' | 'black' }) => {
    const { gameId, userId, color } = data;
    
    const winner = color === 'white' ? 'black' : 'white';
    
    // Broadcast resignation to opponent
    socket.to(gameId).emit("opponent_resigned", { userId, color });
    
    console.log(`Player ${userId} (${color}) resigned in game ${gameId}`);
    
    // Let the winner update the game record
    // This happens through the game_over event from the winning client
  });

  // Chat message
  socket.on("chat_message", (data: {
    gameId: string,
    userId: string,
    message: string
  }) => {
    // Simply relay the message to the other player
    socket.to(data.gameId).emit("chat_message", data);
  });
  
  // Handle disconnect
  socket.on("disconnect", () => {
    // Get the game this socket was in
    const gameId = playerGameMap.get(socket.id);
    
    if (gameId) {
      console.log(`Player ${socket.id} disconnected from game ${gameId}`);
      
      // Notify the opponent about disconnection
      socket.to(gameId).emit("opponent_disconnected");
      
      // Remove from the player-game tracking map
      playerGameMap.delete(socket.id);
    }
  });
}