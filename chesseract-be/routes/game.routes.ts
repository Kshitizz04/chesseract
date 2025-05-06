import {Router} from 'express';
import authorize from '../middlewares/auth.middleware.ts';
import { getUserGames, getGameById } from '../controllers/game/game.controller.ts';
const gameRouter = Router();

gameRouter.get('/game-history/:userId', authorize, getUserGames);

gameRouter.get('/game-details/:gameId', authorize, getGameById);

gameRouter.post('/', (req, res) => {
    res.send('CREATE game route');
});

export default gameRouter;

