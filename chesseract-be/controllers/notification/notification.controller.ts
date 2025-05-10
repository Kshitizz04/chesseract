import { Request, Response, NextFunction } from 'express';
import Notification from '../../models/notification.model.ts';
import FriendRequest from '../../models/friend-request.model.ts';
import GameChallenge from '../../models/game-challenge.model.ts';
import User from '../../models/user.model.ts';
import { CustomError } from '../../utils/CustomError.ts';
import { HandleChallengeReqBody, HandleFriendReqBody, MarkAsReadBody } from './notification.types.ts';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            const error = new CustomError('Not authorized', 401);
            throw error;
        }

        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .populate('sender', 'username profilePicture _id')
            .populate({
                path: 'relatedId',
                select: 'status format timeControl color',
        });

        const unreadCount = await Notification.countDocuments({ 
            recipient: userId, 
            read: false 
        });

        res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: {
                notifications,
                unreadCount
            }
        });

    } catch (error) {
        next(error);
    }
};

// Mark notifications as read
export const markAsRead = async (req: Request<{}, any, MarkAsReadBody>, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        const { notificationIds } = req.body;

        if (!userId) {
            const error = new CustomError('Not authorized', 401);
            throw error;
        }

        if (!notificationIds || !Array.isArray(notificationIds)) {
            const error = new CustomError('Notification IDs must be provided as an array', 400);
            throw error;
        }

        await Notification.updateMany(
            { 
                _id: { $in: notificationIds },
                recipient: userId 
            },
            { $set: { read: true } }
        );

        const unreadCount = await Notification.countDocuments({ 
            recipient: userId, 
            read: false 
        });

        res.status(200).json({
            success: true,
            message: 'Notifications marked as read',
            data: {unreadCount}
        });

    } catch (error) {
        next(error);
    }
};

// Handle friend request (accept/reject)
export const handleFriendRequest = async (req: Request<{}, any, HandleFriendReqBody>, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { requestId, action } = req.body;

    if (!userId) {
      const error = new CustomError('Not authorized', 401);
      throw error;
    }

    if (!requestId || !action) {
      const error = new CustomError('Request ID and action are required', 400);
      throw error;
    }

    if (!['accept', 'reject'].includes(action)) {
      const error = new CustomError('Invalid action. Must be "accept" or "reject"', 400);
      throw error;
    }

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      const error = new CustomError('Friend request not found', 404);
      throw error;
    }

    // Verify the current user is the receiver
    if (friendRequest.receiver.toString() !== userId.toString()) {
      const error = new CustomError('Not authorized to handle this request', 403);
      throw error;
    }

    // Update friend request status
    friendRequest.status = action === 'accept' ? 'accepted' : 'rejected';
    await friendRequest.save();

    // If accepted, update both users' friends lists
    if (action === 'accept') {
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { friends: friendRequest.sender } }
      );
      
      await User.findByIdAndUpdate(
        friendRequest.sender,
        { $addToSet: { friends: userId } }
      );
    }

    // Update notification to mark as read
    await Notification.findOneAndUpdate(
      { 
        recipient: userId,
        type: 'friend_request',
        relatedId: requestId
      },
      { read: true }
    );

    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });

    res.status(200).json({
      success: true,
      message: `Friend request ${action}ed successfully`,
      data: friendRequest,
      unreadCount
    });

  } catch (error) {
    next(error);
  }
};

// Handle game challenge (accept/reject)
export const handleGameChallenge = async (req: Request<{}, any, HandleChallengeReqBody>, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { challengeId, action } = req.body;

    if (!userId) {
      const error = new CustomError('Not authorized', 401);
      throw error;
    }

    if (!challengeId || !action) {
      const error = new CustomError('Challenge ID and action are required', 400);
      throw error;
    }

    if (!['accept', 'reject'].includes(action)) {
      const error = new CustomError('Invalid action. Must be "accept" or "reject"', 400);
      throw error;
    }

    // Find the game challenge
    const gameChallenge = await GameChallenge.findById(challengeId);

    if (!gameChallenge) {
      const error = new CustomError('Game challenge not found', 404);
      throw error;
    }

    // Check if challenge is expired
    if (gameChallenge.expiresAt < new Date()) {
      gameChallenge.status = 'expired';
      await gameChallenge.save();
      const error = new CustomError('Game challenge has expired', 400);
      throw error;
    }

    // Verify the current user is the recipient
    if (gameChallenge.recipient.toString() !== userId.toString()) {
      const error = new CustomError('Not authorized to handle this challenge', 403);
      throw error;
    }

    // Update game challenge status
    gameChallenge.status = action === 'accept' ? 'accepted' : 'rejected';
    await gameChallenge.save();

    // Update notification to mark as read
    await Notification.findOneAndUpdate(
      { 
        recipient: userId,
        type: 'game_challenge',
        relatedId: challengeId
      },
      { read: true }
    );

    // If accepted, return details needed to create/join the game
    let gameData = null;
    if (action === 'accept') {
      gameData = {
        challengerId: gameChallenge.challenger,
        recipientId: gameChallenge.recipient,
        timeControl: gameChallenge.timeControl,
        format: gameChallenge.format,
        color: gameChallenge.color
      };
    }

    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });

    res.status(200).json({
      success: true,
      message: `Game challenge ${action}ed successfully`,
      data: gameChallenge,
      gameData,
      unreadCount
    });

  } catch (error) {
    next(error);
  }
};