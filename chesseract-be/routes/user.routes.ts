import {Router} from 'express';
import { getUser, getUsers } from '../controllers/user/user.controller.ts';
import authorize from './../middlewares/auth.middleware.ts';

const userRouter = Router();

userRouter.get('/', authorize, getUsers);

userRouter.get('/:id', authorize, getUser);

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
