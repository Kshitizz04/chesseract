import React from 'react';
import { ImSpinner2, ImSpinner9 } from 'react-icons/im';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 24, 
  color = 'text-100',
  className = ''
}) => {
  return (
    <ImSpinner2 
      size={size} 
      color={color} 
      className={`animate-spin ${className}`}
      data-testid="loading-spinner"
    />
  );
};

export default LoadingSpinner;