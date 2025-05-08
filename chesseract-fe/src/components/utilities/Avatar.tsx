import React from 'react';
import Image from 'next/image';
import { FaUser } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface AvatarProps {
  username: string;
  profileImage?: string;
  showUsername?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  username,
  profileImage,
  showUsername = false,
  size = 40,
  className = '',
  onClick = () => {},
}) => {
    const router = useRouter();

  return (
    <div 
        className={`flex items-center gap-2 ${className} text-accent-200 cursor-pointer`}
        onClick={onClick}
    >
      <div 
        className="rounded-full border-1 border-accent-100 overflow-hidden flex items-center justify-center bg-bg-100 font-semibold"
        style={{ width: size, height: size }}
      >
        {profileImage ? (
          <Image
            src={profileImage}
            alt={`${username}'s profile`}
            width={size}
            height={size}
            className="object-cover w-full h-full"
          />
        ) : (
            <FaUser size={size-10}/>
        )}
      </div>
      
      {showUsername && (
        <div className="flex flex-col text-text-100">
          <p className="font-medium truncate" style={{ maxWidth: '150px' }}>
            {username}
          </p>
        </div>
      )}
    </div>
  );
};

export default Avatar;