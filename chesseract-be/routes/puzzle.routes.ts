import {Router} from 'express';
import authorize from '../middlewares/auth.middleware.ts';
import { getInitialBatch, getNextBatch, getUserScoreById } from '../controllers/puzzle/puzzle.controller.ts';

const puzzleRouter = Router();

puzzleRouter.get('/initial-batch', authorize, getInitialBatch);
puzzleRouter.get('/next-batch', authorize, getNextBatch);
puzzleRouter.get('/user-score/:userId', authorize, getUserScoreById);
puzzleRouter.put('/user-score', authorize, getUserScoreById);

export default puzzleRouter;