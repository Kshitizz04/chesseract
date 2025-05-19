import { Router } from 'express';
import { getFriends, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, getFriendRequests, getSuggestions } from '../controllers/friends/friends.controller.ts';
import authorize from '../middlewares/auth.middleware.ts';

const friendRouter = Router();

// Get all friends
friendRouter.get('/all-friends/:userId', authorize, getFriends);

// Get all friend requests (sent and received)
friendRouter.get('/requests', authorize, getFriendRequests);

friendRouter.get('/suggestions', authorize, getSuggestions);

// Send friend request
friendRouter.post('/request', authorize, sendFriendRequest);

// Accept friend request
friendRouter.put('/accept', authorize, acceptFriendRequest);

// Reject friend request
friendRouter.put('/reject', authorize, rejectFriendRequest);

// Remove friend
friendRouter.delete('/:friendId', authorize, removeFriend);

export default friendRouter;