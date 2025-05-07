export type TimeFormats = "bullet" | "blitz" | "rapid" 

export type ResultReason = 'checkmate' | 'stalemate' | 'timeout' | 'resignation' | 'draw by agreement' | 'insufficient material' | 'threefold repetition' | 'fifty-move rule' | 'disconnection' | 'other';

export type TimeFrame = '1w' | '1m' | '3m' | '6m' | '1y';