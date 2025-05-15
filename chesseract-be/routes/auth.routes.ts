import  {Router} from 'express';
import { refreshToken, signIn, signUp } from '../controllers/auth/auth.controller.ts';

const authRouter = Router();

authRouter.post('/sign-up', signUp);
authRouter.post('/sign-in', signIn);
authRouter.get('/refresh-token', refreshToken);

export default authRouter;

