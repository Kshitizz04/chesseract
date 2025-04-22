import {Router} from 'express';
const userRouter = Router();

userRouter.get('/', (req, res) => {
    res.send('GET all users');
});

userRouter.get('/:id', (req, res) => {
    res.send('GET user route');
});

userRouter.post('/', (req, res) => {
    res.send('CREATE user route');
});

userRouter.put('/:id', (req, res) => {
    res.send('UPDATE user route');
});

userRouter.delete('/:id', (req, res) => {
    res.send('DELETE user route');
});

export default userRouter;
