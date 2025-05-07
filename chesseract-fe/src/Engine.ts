// Interface for move analysis results
interface MoveAnalysis {
  move: string;
  score: number;
  mate?: number;
  line: string[];
}

// Position evaluation result interface
interface PositionEvaluation {
  score: number; // centipawns or mate score
  isMate: boolean;
  depth: number;
  bestLine: string[];
}

export class ChessEngine {
  private engine: Worker | null = null;
  private isReady: boolean = false;
  private analysisCallbacks: Map<string, (data: any) => void> = new Map();
  private skillLevel: number = 10;
  private searchDepth: number = 18;
  private moveErrorProbability: number = 0; // Probability of making a suboptimal move
  private blunderFactor: number = 0; // How bad the blunders should be (0 means no blunders)

  constructor() {
    // Initialize engine only in browser environment
    if (typeof window !== 'undefined') {
      this.initializeEngine();
    }
  }

  private initializeEngine(): void {
    try {
      // Create a web worker for Stockfish - dynamic creation
      this.engine = new window.Worker(new URL('/stockfish.js', window.location.origin));
      
      this.engine.onmessage = (event: MessageEvent) => {
        const message = event.data;
        this.handleEngineMessage(message);
      };

      // Initialize engine
      this.engine.postMessage('uci');
      this.engine.postMessage('isready');
      this.engine.postMessage(`setoption name Skill Level value ${this.skillLevel}`);
    } catch (error) {
      console.error("Failed to initialize Stockfish engine:", error);
    }
  }

  private handleEngineMessage(message: string): void {
    // Engine is ready
    if (message === 'readyok') {
      this.isReady = true;
    }
    
    // Handle bestmove messages
    if (message.startsWith('bestmove')) {
      if (this.analysisCallbacks.has('bestMove')) {
        const moveRegex = /bestmove\s+(\w+)/;
        const match = message.match(moveRegex);
        
        if (match && match[1]) {
          const bestMove = match[1];
          this.analysisCallbacks.get('bestMove')?.({ 
            move: bestMove, 
            from: bestMove.substring(0, 2),
            to: bestMove.substring(2, 4),
            promotion: bestMove.length > 4 ? bestMove.substring(4, 5) : undefined
          });
        }
      }
    }
    
    // Handle info messages (for position evaluation and move analysis)
    if (message.startsWith('info') && message.includes('score')) {
      // Parse evaluation data
      const depthMatch = /depth (\d+)/.exec(message);
      const scoreMatch = /score (\w+) (-?\d+)/.exec(message);
      const mateMatch = /score mate (-?\d+)/.exec(message);
      const pvMatch = /pv (.+)$/.exec(message);
      
      const depth = depthMatch ? parseInt(depthMatch[1]) : 0;
      const score = scoreMatch ? parseInt(scoreMatch[2]) : null;
      const mate = mateMatch ? parseInt(mateMatch[1]) : null;
      const moves = pvMatch ? pvMatch[1].split(' ') : [];

      // Position evaluation callback
      if (this.analysisCallbacks.has('evaluation') && depth >= 15) {
        this.analysisCallbacks.get('evaluation')?.({
          score: mate ? Infinity * Math.sign(mate) : (score || 0),
          isMate: !!mate,
          depth,
          bestLine: moves
        });
        
        // Remove callback after getting deep evaluation
        if (depth >= 18) {
          this.analysisCallbacks.delete('evaluation');
        }
      }
      
      // Multiple moves analysis
      if (this.analysisCallbacks.has('multipleMovesAnalysis') && depth >= 16 && moves.length > 0) {
        const moveAnalysis: MoveAnalysis = {
          move: moves[0],
          score: mate ? Infinity * Math.sign(mate) : (score || 0),
          line: moves,
        };
        
        if (mate) {
          moveAnalysis.mate = mate;
        }
        
        this.analysisCallbacks.get('multipleMovesAnalysis')?.(moveAnalysis);
      }
    }
  }

  /**
   * Sets the skill level of the engine (1-20)
   * @param level Skill level between 1 (weakest) and 20 (strongest)
   */
  setSkillLevel(level: number): void {
    if (level < 1 || level > 20) {
      throw new Error('Skill level must be between 1 and 20');
    }
    if (this.engine === null) {
      throw new Error('Engine is not initialized');
    }
    
    this.skillLevel = level;
    this.engine.postMessage(`setoption name Skill Level value ${level}`);
  }

  /**
   * Finds the best move for a given position
   * @param fen FEN string representing the current position
   * @param moveTime Time in milliseconds to analyze the position
   * @returns Promise that resolves with the best move information
   */
  findBestMove(fen: string, moveTime: number = 1000): Promise<{move: string, from: string, to: string, promotion?: string}> {
    return new Promise((resolve) => {
      if (this.engine === null) {
        throw new Error('Engine is not initialized');
      }
      this.analysisCallbacks.set('bestMove', resolve);
      
      this.engine.postMessage(`position fen ${fen}`);
      this.engine.postMessage(`go movetime ${moveTime}`);
    });
  }

  /**
   * Evaluates the current position
   * @param fen FEN string representing the position to evaluate
   * @returns Promise that resolves with position evaluation
   */
  evaluatePosition(fen: string): Promise<PositionEvaluation> {
    return new Promise((resolve) => {
      if (this.engine === null) {
        throw new Error('Engine is not initialized');
      }
      this.analysisCallbacks.set('evaluation', resolve);
      
      this.engine.postMessage(`position fen ${fen}`);
      this.engine.postMessage('go depth 18');
    });
  }

  /**
   * Finds multiple candidate moves and their evaluations for a given position
   * @param fen FEN string representing the position
   * @param multipv Number of different moves to analyze (e.g., 10 for top 10 moves)
   * @returns Promise that resolves with array of move analyses
   */
  analyzeMultipleMoves(fen: string, multipv: number = 10): Promise<MoveAnalysis[]> {
    return new Promise((resolve) => {
      if (this.engine === null) {
        throw new Error('Engine is not initialized');
      }
      const moveAnalyses: MoveAnalysis[] = [];
      
      const handleAnalysis = (analysis: MoveAnalysis) => {
        // Check if we already have this move
        const existingIndex = moveAnalyses.findIndex(m => m.move === analysis.move);
        
        if (existingIndex >= 0) {
          // Update existing analysis if the depth is better
          moveAnalyses[existingIndex] = analysis;
        } else {
          // Add new analysis
          moveAnalyses.push(analysis);
        }
        
        // If we have enough moves, resolve the promise
        if (moveAnalyses.length >= multipv) {
          moveAnalyses.sort((a, b) => b.score - a.score);
          this.analysisCallbacks.delete('multipleMovesAnalysis');
          resolve(moveAnalyses);
        }
      };
      
      this.analysisCallbacks.set('multipleMovesAnalysis', handleAnalysis);
      
      // Set MultiPV option to explore multiple variations
      this.engine.postMessage(`setoption name MultiPV value ${multipv}`);
      this.engine.postMessage(`position fen ${fen}`);
      this.engine.postMessage('go depth 16');
      
      // Set a timeout in case we don't get enough moves
      setTimeout(() => {
        if (moveAnalyses.length > 0 && this.analysisCallbacks.has('multipleMovesAnalysis')) {
          moveAnalyses.sort((a, b) => b.score - a.score);
          this.analysisCallbacks.delete('multipleMovesAnalysis');
          resolve(moveAnalyses);
        }
      }, 5000);
    });
  }

  /**
   * Gets the top N best moves (first variation) and the second-best N moves (second variation)
   * @param fen FEN string representing the position
   * @param count Number of moves to return for each variation
   */
  async getTopAndSecondBestMoves(fen: string, count: number = 10): Promise<{
    topMoves: MoveAnalysis[],
    secondBestMoves: MoveAnalysis[]
  }> {
    const allMoves = await this.analyzeMultipleMoves(fen, count * 2);
    
    // Separate into two groups - potentially by starting move
    const firstMoveGroups = new Map<string, MoveAnalysis[]>();
    
    allMoves.forEach(move => {
      const firstMove = move.move;
      if (!firstMoveGroups.has(firstMove)) {
        firstMoveGroups.set(firstMove, []);
      }
      firstMoveGroups.get(firstMove)!.push(move);
    });
    
    // Sort the groups by their best evaluation
    const sortedGroups = Array.from(firstMoveGroups.entries())
      .sort((a, b) => {
        const aScore = Math.max(...a[1].map(m => m.score));
        const bScore = Math.max(...b[1].map(m => m.score));
        return bScore - aScore;
      });
    
    // Get top moves and second-best moves
    const topMoves = sortedGroups[0]?.[1].slice(0, count) || [];
    const secondBestMoves = sortedGroups[1]?.[1].slice(0, count) || [];
    
    return { topMoves, secondBestMoves };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.engine) {
      this.engine.postMessage('quit');
    }
  }
}

// Create singleton instance
// const chessEngine = new ChessEngine();

// export default chessEngine;
