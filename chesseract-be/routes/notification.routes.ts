import express from 'express';
import { getNotifications, handleFriendRequest, handleGameChallenge, markAsRead } from '../controllers/notification/notification.controller.ts';
import authorize from './../middlewares/auth.middleware.ts';

const NotificationRouter = express.Router();

// Get all notifications for current user
NotificationRouter.get('', authorize, getNotifications);

// Mark notifications as read
NotificationRouter.put('/mark-as-read', authorize, markAsRead);

// Handle friend request
NotificationRouter.put('/friend-request', authorize, handleFriendRequest);

// Handle game challenge
NotificationRouter.put('/game-challenge', authorize, handleGameChallenge);

export default NotificationRouter;