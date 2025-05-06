import {Router} from 'express';
import authorize from './../middlewares/auth.middleware.ts';
import { getAdvancedAnalytics, getUserRatingHistory, getUserStats } from '../controllers/analytics/analytics.controller.ts';

const analyticsRouter = Router();

analyticsRouter.get('/stats/:userId', authorize, getUserStats);

analyticsRouter.get('/rating-history/:userId', authorize, getUserRatingHistory);

analyticsRouter.get('/advanced-analytics/:userId', authorize, getAdvancedAnalytics)

export default analyticsRouter;