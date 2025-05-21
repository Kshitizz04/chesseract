import {Router} from 'express';
import { editProfile, getUser, getUsers, updateOnlineVisibility, deleteAccount } from '../controllers/user/user.controller.ts';
import authorize from './../middlewares/auth.middleware.ts';

const userRouter = Router();

userRouter.get('/', authorize, getUsers);

userRouter.get('/:id', authorize, getUser);

userRouter.put('', authorize, editProfile);

userRouter.delete('/', authorize, deleteAccount);

userRouter.put('/online-visibility', authorize, updateOnlineVisibility);

export default userRouter;
