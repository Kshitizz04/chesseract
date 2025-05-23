import React, { useEffect, useState } from 'react';
import CustomModal from './CustomModal';
import LoadingSpinner from '../utilities/LoadingSpinner';
import CustomButton from '../utilities/CustomButton';
import Avatar from '../utilities/Avatar';

interface OpponentData {
  username: string;
  profileImage?: string;
  rating: number;
}

interface FindingMatchModalProps {
  onCancel: () => void;
  userData: {
    username: string;
    profileImage?: string;
    rating: number;
  };
  opponentData: OpponentData | null;
  onJoinGame: () => void;
  timeControl: string;
  closeAfterJoin: () => void;
  processingComplete: boolean;
}

const FindingMatchModal: React.FC<FindingMatchModalProps> = ({
  onCancel,
  userData,
  opponentData,
  onJoinGame,
  timeControl,
  closeAfterJoin,
  processingComplete,
}) => {
  const [showOpponent, setShowOpponent] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [fadeState, setFadeState] = useState('');
  const [shouldJoinGame, setShouldJoinGame] = useState(false);

  useEffect(() => {
    if (shouldJoinGame && processingComplete) {
      const gameStartTimer = setTimeout(() => {
        closeAfterJoin();
      }, 0);
      return () => clearTimeout(gameStartTimer);
    }
  }, [shouldJoinGame, processingComplete]);

  useEffect(() => {
    if (opponentData) {
      setFadeState('fade-out');
      
      // Delay showing opponent to allow for fade transition
      const transitionTimer = setTimeout(() => {
        setShowOpponent(true);
        setFadeState('fade-in');
      }, 300);
      
      return () => clearTimeout(transitionTimer);
    }
  }, [opponentData]);

  useEffect(() => {
    onJoinGame();
    if (showOpponent && countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown <= 1) {
          setShouldJoinGame(true);
        }
        setCountdown(prev => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [showOpponent, countdown]);

  return (
    <CustomModal onClose={onCancel}>
      <div className="w-full h-full flex flex-col items-center justify-between p-6">
        {!showOpponent ? (
          <div 
            className={`flex flex-col items-center justify-center flex-1 w-full transition-opacity duration-300 ${fadeState === 'fade-out' ? 'opacity-0' : 'opacity-100'}`}
          >
            <h2 className="text-2xl font-bold mb-6">Finding Match</h2>
            <div className="mb-4">
              <LoadingSpinner/>
            </div>
            <p className="mb-2 text-lg">Looking for an opponent...</p>
            <p className="mb-6 text-sm text-text-100">{timeControl} game</p>
            <CustomButton onClick={onCancel} className="mt-4 bg-bg-100">
              Cancel
            </CustomButton>
          </div>
        ) : (
          <div 
            className={`flex flex-col items-center justify-center flex-1 w-full transition-opacity duration-300 ${fadeState === 'fade-in' ? 'opacity-100' : 'opacity-0'}`}
          >
            <h2 className="text-2xl font-bold mb-6">Match Found!</h2>
            <p className="mb-6 text-lg">Game starts in {countdown}</p>
            
            <div className="flex items-center justify-between w-full max-w-md mb-8">
              <div className="flex flex-col items-center">
                <Avatar 
                  username={userData.username}
                  profileImage={userData.profileImage}
                  size={64}
                />
                <p className="mt-2 font-semibold">{userData.username}</p>
                <p className="text-sm text-text-100">{userData.rating}</p>
              </div>
              
              <div className="flex flex-col items-center">
                <p className="text-2xl font-bold">VS</p>
                <p className="text-sm">{timeControl}</p>
              </div>
              
              <div className="flex flex-col items-center">
                <Avatar 
                  username={opponentData?.username || "Opponent"}
                  profileImage={opponentData?.profileImage}
                  size={64}
                />
                <p className="mt-2 font-semibold">{opponentData?.username}</p>
                <p className="text-sm text-text-100">{opponentData?.rating}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomModal>
  );
};

export default FindingMatchModal;