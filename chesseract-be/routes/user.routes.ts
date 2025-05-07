import {Router} from 'express';
import { editProfile, getUser, getUsers } from '../controllers/user/user.controller.ts';
import authorize from './../middlewares/auth.middleware.ts';

const userRouter = Router();

userRouter.get('/', authorize, getUsers);

userRouter.get('/:id', authorize, getUser);

userRouter.put('', authorize, editProfile);

userRouter.delete('/:id', (req, res) => {
    res.send('DELETE user route');
});

export default userRouter;
