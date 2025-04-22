import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGame extends Document {
    whitePlayer: Types.ObjectId;
    blackPlayer: Types.ObjectId;
    moves: string[]; // UCI or SAN notation
    result: '1-0' | '0-1' | '1/2-1/2' | '*';
    timeControl: string; // e.g. '5+0', '3+2'
    startTime: Date;
    winner?: 'white' | 'black' | 'draw';
    fenAfterEachMove?: string[];
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
    moves: [{ type: String }], // e.g., ["e4", "e5", "Nf3", "Nc6"]
    result: { 
        type: String, 
        enum: ['1-0', '0-1', '1/2-1/2', '*'], 
        default: '*' 
    },
    timeControl: { 
        type: String, 
        required: true 
    }, // like '3+2'
    startTime: { 
        type: Date, 
        default: Date.now 
    },
    winner: { 
        type: String, 
        enum: ['white', 'black', 'draw'] 
    },
    fenAfterEachMove: [{ 
        type: String 
    }],
}, {timestamps: true});

const Game = mongoose.model("Game", gameSchema);

export default Game;