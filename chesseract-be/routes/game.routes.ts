import {Router} from 'express';
const gameRouter = Router();

gameRouter.get('/', (req, res) => {
    res.send('GET all games');
});

gameRouter.get('/:id', (req, res) => {
    res.send('GET game route');
});

gameRouter.post('/', (req, res) => {
    res.send('CREATE game route');
});

export default gameRouter;

