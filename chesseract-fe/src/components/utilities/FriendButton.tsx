import React, { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import sendFriendRequest from "@/services/sendFriendRequest";
import removeFriend from "@/services/removeFriend";
import { FaUserPlus, FaUserMinus, FaUserTimes } from "react-icons/fa";
import Button from "./CustomButton";
import cancelFriendRequest from "@/services/cancelFriendRequest";

export enum FriendStatus {
  NOT_FRIENDS = 0,
  FRIENDS = 1,
  REQUESTED = 2
}

interface FriendActionButtonProps {
  friendId: string;
  friendStatus: FriendStatus;
  onActionComplete?: () => void;
  className?: string;
  width?: string;
  showText?: boolean;
}

const FriendButton: React.FC<FriendActionButtonProps> = ({
  friendId,
  friendStatus,
  onActionComplete,
  className = "",
  width = "w-32",
  showText = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleAction = async () => {
    try {
      setIsLoading(true);
      let response;

      switch (friendStatus) {
        case FriendStatus.NOT_FRIENDS:
          response = await sendFriendRequest({ recieverId: friendId });
          if (response.success) {
            showToast("Friend request sent successfully", "success");
          } else {
            showToast(response.error || "Failed to send friend request", "error");
          }
          break;

        case FriendStatus.FRIENDS:
          response = await removeFriend(friendId);
          if (response.success) {
            showToast("Friend removed successfully", "success");
          } else {
            showToast(response.error || "Failed to remove friend", "error");
          }
          break;

        case FriendStatus.REQUESTED:
          response = await cancelFriendRequest(friendId);
          if (response.success) {
            showToast("Friend request cancelled", "success");
          } else {
            showToast(response.error || "Failed to cancel friend request", "error");
          }
          break;
      }

      if (response?.success && onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error("Friend action error:", error);
      showToast("An error occurred while processing your request", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    switch (friendStatus) {
      case FriendStatus.NOT_FRIENDS:
        return "Add";
      case FriendStatus.FRIENDS:
        return "Remove";
      case FriendStatus.REQUESTED:
        return "Cancel";
      default:
        return "Add Friend";
    }
  };
  
  const getButtonIcon = () => {
    switch (friendStatus) {
      case FriendStatus.NOT_FRIENDS:
        return <FaUserPlus/>;
      case FriendStatus.FRIENDS:
        return <FaUserMinus/>;
      case FriendStatus.REQUESTED:
        return <FaUserTimes/>;
      default:
        return null;
    }
  };

  return (
    <Button
      width={width}
      className={`flex items-center bg-bg-200 justify-center${className}`}
      onClick={handleAction}
      disabled={isLoading}
      title={getButtonText()}
    >
      {getButtonIcon()}
      {showText && <p className="text-sm ml-1">{getButtonText()}</p>}
    </Button>
  );
};

export default FriendButton;