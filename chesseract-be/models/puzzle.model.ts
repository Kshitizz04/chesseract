import mongoose, { Schema, Document} from "mongoose";

export interface IPuzzle extends Document {
    PuzzleId: string;
    FEN: string;
    Moves: string;
    Rating: number;
    Themes: string;
    OpeningTags: string;
}

const puzzleSchema = new Schema<IPuzzle>({
    PuzzleId: {
        type: String,
        required: [true, "PuzzleId is required"],
        unique: true,
        trim: true,
    },
    FEN: {
        type: String,
        required: [true, "FEN is required"],
        trim: true,
    },
    Moves: {
        type: String,
        required: [true, "Moves are required"],
        trim: true,
    },
    Rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: [0, "Rating must be a positive number"],
    },
    Themes: {
        type: String,
        required: [true, "Themes are required"],
        default: "None",
        trim: true,
    },
    OpeningTags: {
        type: String,
        required: [true, "OpeningTags are required"],
        default: "None",
        trim: true,
    }
});

const Puzzle = mongoose.model("Puzzle", puzzleSchema);

export default Puzzle;