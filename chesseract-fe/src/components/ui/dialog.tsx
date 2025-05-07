import React, { ReactNode, useState, createContext, useContext } from 'react';

interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface DialogTriggerProps {
    children: ReactNode;
    asChild?: boolean;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const Dialog = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ 
  children, 
  asChild = false 
}: DialogTriggerProps) => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogTrigger must be used within a Dialog');
  
  if (asChild) {
    // Clone the child element and add the onClick handler
    const childElement = React.Children.only(children) as React.ReactElement;
    return React.cloneElement(
      childElement,
      {
        // onClick: (e: React.MouseEvent) => {
        //   context.setOpen(true);
        //   // Call the original onClick if it exists
        //   if (childElement.props && typeof childElement.props.onClick === 'function') {
        //     childElement.props.onClick(e);
        //   }
        // },
      }
    );
  }

  return (
    <button onClick={() => context.setOpen(true)}>
      {children}
    </button>
  );
};

export const DialogContent = ({ children }: { children: ReactNode }) => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogContent must be used within a Dialog');

  if (!context.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-auto p-6">
        <div className="relative">
          <button
            onClick={() => context.setOpen(false)}
            className="absolute right-0 top-0 p-2"
          >
            ✕
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export const DialogHeader = ({ children }: { children: ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};

export const DialogTitle = ({ children }: { children: ReactNode }) => {
  return <h2 className="text-xl font-semibold">{children}</h2>;
};