import { Server, Socket } from "socket.io";

// Store active users looking for a match
const waitingPlayers: Map<string, { socketId: string, rating?: number }> = new Map();

export default function registerMatchmakingEvents(io: Server, socket: Socket): void {
  // Join matchmaking queue
  socket.on("find_match", (userData: { userId: string, rating?: number }) => {
    const { userId, rating } = userData;
    
    console.log(`User ${userId} (${socket.id}) looking for a match`);
    waitingPlayers.set(userId, { socketId: socket.id, rating });
    
    // Simple matchmaking - find any other waiting player
    for (const [waitingId, waitingUser] of waitingPlayers.entries()) {
      if (waitingId !== userId && waitingUser.socketId !== socket.id) {
        // Create a game room with these two players
        const gameId = `game_${Date.now()}`;
        
        // Remove both players from waiting list
        waitingPlayers.delete(userId);
        waitingPlayers.delete(waitingId);
        
        // Notify both players
        io.to(socket.id).emit("match_found", { gameId, opponentId: waitingId });
        io.to(waitingUser.socketId).emit("match_found", { gameId, opponentId: userId });
        
        console.log(`Match created: ${gameId} between ${userId} and ${waitingId}`);
        break;
      }
    }
  });

  // Cancel matchmaking
  socket.on("cancel_matchmaking", (userData: { userId: string }) => {
    const { userId } = userData;
    waitingPlayers.delete(userId);
    console.log(`User ${userId} canceled matchmaking`);
  });

  // Clean up on disconnect
  socket.on("disconnect", () => {
    // Remove from waiting players
    for (const [userId, user] of waitingPlayers.entries()) {
      if (user.socketId === socket.id) {
        waitingPlayers.delete(userId);
        break;
      }
    }
  });
}