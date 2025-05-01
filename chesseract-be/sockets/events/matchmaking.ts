import { Server, Socket } from "socket.io";
import mongoose, {Types} from "mongoose";
import Game from "../../models/game.model.ts";
import { TimeFormat } from "../../types/TimeFormat.ts";

interface WaitingPlayer {
  socketId: string;
  userId: string;
  username: string;
  profilePicture: string;
  rating: number;
  timeControl: {
    initial: number;
    increment: number;
  };
}

const waitingPlayers: WaitingPlayer[] = [];

// Rating difference threshold - adjust as needed
const RATING_THRESHOLD = 200;

export default function registerMatchmakingEvents(io: Server, socket: Socket): void {
  // Join matchmaking queue
  socket.on("find_match", async (userData: { 
    userId: string, 
    username: string,
    profilePicture: string,
    rating: number,
    timeFormat: TimeFormat,
    timeControl: { initial: number, increment: number }
  }) => {
    const { userId, username, profilePicture, rating, timeControl } = userData;
    
    console.log(`User ${userId} (${socket.id}) looking for a match with time control: ${timeControl.initial}+${timeControl.increment}`);
    
    // Add player to waiting list
    const newPlayer: WaitingPlayer = {
      socketId: socket.id,
      userId,
      username,
      profilePicture,
      rating,
      timeControl
    };
    
    waitingPlayers.push(newPlayer);
    
    // Find a suitable match
    const matchedPlayerIndex = waitingPlayers.findIndex((player) => 
      player.userId !== userId && 
      player.socketId !== socket.id &&
      player.timeControl.initial === timeControl.initial &&
      player.timeControl.increment === timeControl.increment &&
      Math.abs(player.rating - rating) <= RATING_THRESHOLD
    );
    
    if (matchedPlayerIndex !== -1) {
      const matchedPlayer = waitingPlayers[matchedPlayerIndex];
      
      // Remove both players from waiting list
      waitingPlayers.splice(matchedPlayerIndex, 1);
      const currentPlayerIndex = waitingPlayers.findIndex(p => p.userId === userId);
      if (currentPlayerIndex !== -1) {
        waitingPlayers.splice(currentPlayerIndex, 1);
      }
      
      try {
        // Determine which player is white and which is black (randomly)
        const isWhite = Math.random() >= 0.5;
        const whitePlayerId = isWhite ? userId : matchedPlayer.userId;
        const blackPlayerId = isWhite ? matchedPlayer.userId : userId;
        
        // Create a new game in the database
        const game = new Game({
          whitePlayer: new Types.ObjectId(whitePlayerId),
          blackPlayer: new Types.ObjectId(blackPlayerId),
          status: 'ongoing',
          moves: [],
          fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Initial position
          timeControl: {
            initial: timeControl.initial,
            increment: timeControl.increment
          }
        });
        
        await game.save();
        
        const gameId = (game._id as Types.ObjectId).toString();
        
        // Notify both players
        io.to(socket.id).emit("match_found", { 
          gameId, 
          opponent: {
            id: matchedPlayer.userId,
            username: matchedPlayer.username,
            profilePicture: matchedPlayer.profilePicture,
            rating: matchedPlayer.rating
          },
          color: isWhite ? 'white' : 'black',
          timeControl
        });
        
        io.to(matchedPlayer.socketId).emit("match_found", { 
          gameId, 
          opponent: {
            id: userId,
            username,
            profilePicture,
            rating
          },
          color: isWhite ? 'black' : 'white',
          timeControl
        });
        
        console.log(`Match created: ${gameId} between ${userId} (${isWhite ? 'white' : 'black'}) and ${matchedPlayer.userId} (${isWhite ? 'black' : 'white'})`);
        
      } catch (error) {
        console.error("Error creating game:", error);
        
        // Notify players of error
        io.to(socket.id).emit("matchmaking_error", { message: "Failed to create game" });
        io.to(matchedPlayer.socketId).emit("matchmaking_error", { message: "Failed to create game" });
      }
    }
  });

  // Cancel matchmaking
  socket.on("cancel_matchmaking", (userData: { userId: string }) => {
    const { userId } = userData;
    const index = waitingPlayers.findIndex(player => player.userId === userId);
    
    if (index !== -1) {
      waitingPlayers.splice(index, 1);
      console.log(`User ${userId} canceled matchmaking`);
    }
  });

  // Clean up on disconnect
  socket.on("disconnect", () => {
    // Remove from waiting players
    const index = waitingPlayers.findIndex(player => player.socketId === socket.id);
    
    if (index !== -1) {
      const userId = waitingPlayers[index].userId;
      waitingPlayers.splice(index, 1);
      console.log(`User ${userId} disconnected, removed from matchmaking queue`);
    }
  });
}