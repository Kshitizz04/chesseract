import { Server, Socket } from "socket.io";
import Game from "../../models/game.model.ts";
import { ResultReason } from "../../types/ResultReason.ts";
import { IUser } from "../../models/user.model.ts";

//listening to join_game, move, game_over, resign, chat_message, disconnect
//emitting game_start, opponent_move, game_ended, opponent_resigned, opponent_disconnected

// Track which players are in which games
const playerGameMap = new Map<string, string>(); // socketId -> gameId

// Track players ready in each game
const gameReadyPlayers = new Map<string, Set<string>>(); // gameId -> Set of socketIds

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

      // Add player to ready set
      if (!gameReadyPlayers.has(gameId)) {
        gameReadyPlayers.set(gameId, new Set());
      }
      gameReadyPlayers.get(gameId)!.add(socket.id);
      
      // Check if both players are ready
      if (gameReadyPlayers.get(gameId)!.size === 2) {
        // Both players ready, start the game
        io.to(gameId).emit("game_start", { gameId });
        console.log(`Game ${gameId} started with both players ready`);
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
    winner: 'white' | 'black' | 'draw',
    reason: ResultReason,
    fen: string,
    pgn: string,
    moves: string[]
  }) => {
    const { gameId, winner, reason, moves, fen, pgn } = data;
    
    console.log(`Game over reported for ${gameId}, ${winner} wins by ${reason}`);
    
    try {
      const game = await Game.findById(gameId).populate('whitePlayer blackPlayer');

      if(!game) {
        socket.emit("game_error", { message: "Game not found" });
        return;
      }

      game.status = 'finished';
      game.winner = winner;
      game.resultReason = reason;
      game.moves = moves || [];
      game.fen = fen;
      game.pgn = pgn;
      game.save();

      const whitePlayer = game.whitePlayer as unknown as IUser;
      const blackPlayer = game.blackPlayer as unknown as IUser;
      const format = game.format;
      let whiteRatingChange = 0;
      let blackRatingChange = 0;

      if(!whitePlayer || !blackPlayer) {
        console.error("Game does not have both players populated", gameId);
      } else{
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const whiteRating = whitePlayer.rating[format];
        const blackRating = blackPlayer.rating[format];
  
        const K = 32;
        if(winner !== 'draw') {
          const expectedWhite = 1 / (1 + Math.pow(10, (blackRating - whiteRating) / 400));
          const expectedBlack = 1 - expectedWhite;
  
          const whiteScore = winner === 'white' ? 1 : 0;
          const blackScore = winner === 'black' ? 1 : 0;
  
          whiteRatingChange = Math.round(K * (whiteScore - expectedWhite));
          blackRatingChange = Math.round(K * (blackScore - expectedBlack));
        }
  
        whitePlayer.rating[format] += whiteRatingChange;
        whitePlayer.stats[format].gamesPlayed += 1;
        whitePlayer.stats[format].highestRating = Math.max(whitePlayer.stats[format].highestRating || 0, whitePlayer.rating[format]);
        whitePlayer.stats[format].lowestRating = Math.min(whitePlayer.stats[format].lowestRating || Infinity, whitePlayer.rating[format]);

        const todayRatingHistory = whitePlayer.ratingHistory[format].find(entry =>
          new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime()
        );
        if(todayRatingHistory) {
          if(todayRatingHistory.rating < whitePlayer.rating[format]) {
            todayRatingHistory.rating = whitePlayer.rating[format];
          }
        }else{
          whitePlayer.ratingHistory[format].push({ date: today, rating: whitePlayer.rating[format] });
        }
  
        blackPlayer.rating[format] += blackRatingChange;
        blackPlayer.stats[format].gamesPlayed += 1;
        blackPlayer.stats[format].highestRating = Math.max(blackPlayer.stats[format].highestRating || 0, blackPlayer.rating[format]);
        blackPlayer.stats[format].lowestRating = Math.min(blackPlayer.stats[format].lowestRating || Infinity, blackPlayer.rating[format]);

        const todayRatingHistoryBlack = blackPlayer.ratingHistory[format].find(entry =>
          new Date(entry.date).setHours(0, 0, 0, 0) === today.getTime()
        );
        if(todayRatingHistoryBlack) {
          if(todayRatingHistoryBlack.rating < blackPlayer.rating[format]) {
            todayRatingHistoryBlack.rating = blackPlayer.rating[format];
          }
        }else{
          blackPlayer.ratingHistory[format].push({ date: today, rating: blackPlayer.rating[format] });
        }
  
        if(winner === 'white') {
          whitePlayer.stats[format].wins += 1;
          blackPlayer.stats[format].losses += 1;
        }else if(winner === 'black') {
          whitePlayer.stats[format].losses += 1;
          blackPlayer.stats[format].wins += 1;
        }else {
          whitePlayer.stats[format].draws += 1;
          blackPlayer.stats[format].draws += 1;
        }
  
        await whitePlayer.save();
        await blackPlayer.save();
      }

      // Broadcast game result to all players in the room
      socket.to(gameId).emit("game_ended", { winner, reason, blackRatingChange, whiteRatingChange });
      
    } catch (error) {
      console.error("Error saving game result:", error);
      socket.emit("game_error", { message: "Failed to save game result" });
    }
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