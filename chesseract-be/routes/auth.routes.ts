import  {Router} from 'express';

const authRouter = Router();

authRouter.post('/sign-up', (req, res) => {
    res.send('sign-up route');
});

authRouter.post('/sign-in', (req, res) => {
    res.send('sign-in route');
});

authRouter.post('/sign-out', (req, res) => {
    res.send('sign-out route');
});

export default authRouter;

