import React, { ReactNode } from 'react';

interface TabProps {
  children: ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  onClick?: () => void;
  children: ReactNode;
  active: boolean;
}

interface TabsContentProps {
  value: string;
  activeTab: string;
  children: ReactNode;
}

export const Tabs = ({ children, className = '' }: TabProps) => {
  return <div className={`w-full ${className}`}>{children}</div>;
};

export const TabsList = ({ children, className = '' }: TabProps) => {
  return (
    <div className={`flex border-b border-accent-200 mb-4 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ onClick, children, active }: TabsTriggerProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm focus:outline-none ${
        active
          ? 'border-b-2 border-accent-200 text-accent-200'
          : 'text-text-100 hover:text-accent-200'
      }`}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, activeTab, children }: TabsContentProps) => {
  if (value !== activeTab) return null;
  return <div>{children}</div>;
};