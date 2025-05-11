import RightModalLayer from '@/components/modals/RightModalLayer';
import { useToast } from '@/contexts/ToastContext';
import handleChallengeFromNotification, { GameChallenge } from '@/services/handleChallengeFromNotification';
import handleRequestFromNotification from '@/services/handleRequestFromNotification';
import markNotificationAsRead from '@/services/markNotificationAsRead';
import { useLayout } from '@/utils/hooks/useLayout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Avatar from '../utilities/Avatar';
import { Notification } from '@/services/getNotifications';
import LoadingSpinner from '../utilities/LoadingSpinner';
import Button from '../utilities/CustomButton';

const NotificationPanel = () => {
    const [processingIds, setProcessingIds] = useState<string[]>([]);

    const {
        isNotificationPanelOpen,
        toggleNotificationPanel,
        notifications,
        refreshNotifications,
        loading
    } = useLayout();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        if (isNotificationPanelOpen && notifications.length > 0) {
            const unreadIds = notifications
                .filter(notification => !notification.read)
                .map(notification => notification._id);
                
            if (unreadIds.length > 0) {
                markNotificationAsRead({notificationIds:unreadIds});
                refreshNotifications();
            }
        }
    }, [isNotificationPanelOpen, notifications]);

    const handleFriendRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
        try {
            console.log("requestId in function", requestId);
            setProcessingIds(prev => [...prev, requestId]);
            const response = await handleRequestFromNotification({requestId, action});
            
            if (response.success) {
                showToast(
                    `Friend request ${action === 'accept' ? 'accepted' : 'rejected'}`, 
                    'success'
                );
                refreshNotifications();
            } else {
                showToast(response.error || 'An error occurred', 'error');
            }
        } catch (error) {
            console.error('Error accepting friend request:', error);
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== requestId));
        }
    };

    const handleGameChallengeAction = async (challengeId: string, action: 'accept' | 'reject') => {
        try {
            setProcessingIds(prev => [...prev, challengeId]);
            const response = await handleChallengeFromNotification({challengeId, action});
            
            if (response.success) {
                if (action === 'accept') {
                    router.push(`/home/play/online/challenge`);
                    toggleNotificationPanel(); // Close the panel
                } else {
                    showToast('Challenge rejected', 'success');
                    refreshNotifications();
                }
            } else {
                showToast(response.error || 'An error occurred', 'error');
            }
        } catch (error) {
            console.log('Failed to process game challenge', error);
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== challengeId));
        }
    };

    const renderFriendRequest = (notification: Notification) => {
        const { sender, relatedId, createdAt, _id } = notification;
        const isProcessing = processingIds.includes(_id);
        
        return (
            <div className="p-4 border-b border-bg-300 flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                    <Avatar
                        username={sender.username} 
                        profileImage={sender.profilePicture} 
                        size={40}
                        showUsername={false}
                    />
                    <div className="flex-1">
                        <p className="font-medium">{sender.username}</p>
                        <p className="text-sm text-text-300">
                            sent you a friend request
                        </p>
                        <p className="text-xs text-text-400">
                            {createdAt.slice(0, 10)} {createdAt.slice(11, 16)}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    {isProcessing ? (
                        <div className="h-9 flex items-center justify-center">
                            <LoadingSpinner />
                        </div>
                    ) : relatedId.status === "pending" ? (
                        <>
                            <Button
                                onClick={() => handleFriendRequestAction(relatedId._id, 'reject')}
                            >
                                Reject
                            </Button>
                            <Button 
                                onClick={() => handleFriendRequestAction(relatedId._id, 'accept')}
                            >
                                Accept
                            </Button>
                        </>
                    ) : (
                        <p className="text-sm text-text-300">
                            {relatedId.status === "accepted" ? "Accepted" : "Rejected"}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    const renderGameChallenge = (notification: Notification) => {
        const { _id, sender, createdAt } = notification;
        const relatedId = notification.relatedId as GameChallenge;
        const isProcessing = processingIds.includes(_id);
        
        // Format time control for display
        const timeControlDisplay = `${relatedId.timeControl.initial}+${relatedId.timeControl.increment}`;
        
        return (
            <div className="p-4 border-b border-bg-300 flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                    <Avatar 
                        username={sender.username} 
                        profileImage={sender.profilePicture} 
                        size={40}
                        showUsername={false}
                    />
                    <div className="flex-1">
                        <p className="font-medium">{sender.username}</p>
                        <p className="text-sm text-text-300">
                            challenged you to a game
                        </p>
                        <p className="text-xs text-accent-200 font-medium">
                            {timeControlDisplay} {relatedId.format}
                            {relatedId.color !== 'random' ? 
                              ` • You play as ${relatedId.color}` : 
                              ' • Random colors'}
                        </p>
                        <p className="text-xs text-text-400">
                            {createdAt.slice(0, 10)} {createdAt.slice(11, 16)}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                    {isProcessing ? (
                        <div className="h-9 flex items-center justify-center">
                            <LoadingSpinner/>
                        </div>
                    ) : (
                        <>
                            <Button 
                                onClick={() => handleGameChallengeAction(relatedId._id, 'reject')}
                            >
                                Decline
                            </Button>
                            <Button 
                                onClick={() => handleGameChallengeAction(relatedId._id, 'accept')}
                            >
                                Accept
                            </Button>
                        </>
                    )}
                </div>
            </div>
        );
    };
    
    return (
        <RightModalLayer
            isOpen={isNotificationPanelOpen}
            onClose={toggleNotificationPanel}
            title="Notifications"
        >
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <LoadingSpinner />
                </div>
            ) : notifications.length > 0 ? (
                <div className="divide-y divide-bg-300">
                    {notifications.map(notification => (
                        <div key={notification._id}>
                            {notification.type === 'friend_request' ? 
                                renderFriendRequest(notification) : 
                                renderGameChallenge(notification)}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-40 text-text-300">
                    <p className="text-lg mb-2">No notifications</p>
                    <p className="text-sm">When you receive notifications, they will appear here</p>
                </div>
            )}
        </RightModalLayer>
    );
};
export default NotificationPanel;