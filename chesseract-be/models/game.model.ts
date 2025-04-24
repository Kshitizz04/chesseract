import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGame extends Document {
    whitePlayer: Types.ObjectId;
    blackPlayer: Types.ObjectId;
    moves: string[]; // UCI or SAN notation
    winner?: 'white' | 'black' | 'draw';
    fen?: string; // FEN string representing the current position
    pgn?: string; // PGN string representing the game
    status: 'ongoing' | 'finished' | 'abandoned';
    timeControl: {
        initial: number; // initial time in seconds
        increment: number; // increment time in seconds
    };
    resultReason?: 'checkmate' | 'stalemate' | 'timeout' | 'resignation' | 'draw by agreement' | 'insufficient material' | 'threefold repetition' | 'fifty-move rule' | 'disconnection' | 'other';
  }

const gameSchema = new Schema<IGame>({
    whitePlayer: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    blackPlayer: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    winner: { 
        type: String, 
        enum: ['white', 'black', 'draw'] 
    },
    moves: [{ type: String }], // e.g., ["e4", "e5", "Nf3", "Nc6"]
    fen: {type: String},
    pgn: {type: String},
    status: {type: String, enum: ['ongoing', 'finished', 'abandoned'], default: 'ongoing'},
    timeControl: {
        initial: { type: Number, required: true },
        increment: { type: Number, required: true },
    },
    resultReason: {type: String, enum: ['checkmate', 'stalemate', 'timeout', 'resignation', 'draw by agreement', 'insufficient material', 'threefold repetition', 'fifty-move rule', 'disconnection', 'other']},
}, {timestamps: true});

const Game = mongoose.model("Game", gameSchema);

export default Game;