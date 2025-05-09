import {Router} from 'express';
import authorize from '../middlewares/auth.middleware.ts';
import { getInitialBatch, getNextBatch } from '../controllers/puzzle/puzzle.controller.ts';

const puzzleRouter = Router();

puzzleRouter.get('/initial-batch', authorize, getInitialBatch);
puzzleRouter.get('/next-batch', authorize, getNextBatch);

export default puzzleRouter;