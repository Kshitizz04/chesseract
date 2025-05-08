import { Router } from 'express';
import { getFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, getFriendRequests } from '../controllers/friends/friends.controller.ts';
import authorize from '../middlewares/auth.middleware.ts';

const friendRouter = Router();

// Get all friends
friendRouter.get('/:userId', authorize, getFriends);

// Get all friend requests (sent and received)
friendRouter.get('/requests', authorize, getFriendRequests);

// Send friend request
friendRouter.post('/request', authorize, sendFriendRequest);

// Accept friend request
friendRouter.put('/accept', authorize, acceptFriendRequest);

// Reject friend request
friendRouter.put('/reject', authorize, rejectFriendRequest);

// Remove friend
friendRouter.delete('/:friendId', authorize, removeFriend);

export default friendRouter;