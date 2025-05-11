import { useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import { IoArrowBack } from 'react-icons/io5';

interface RightModalLayerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const RightModalLayer: React.FC<RightModalLayerProps> = ({
    isOpen,
    onClose,
    title,
    children
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

    // Handle outside click (desktop only)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        // Only handle outside clicks on desktop
        if (window.innerWidth >= 768) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Prevent body scrolling when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    // Handle escape key press
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/10 transition-opacity">
        {/* Modal container */}
            <div 
                ref={modalRef}
                className={`
                    flex flex-col bg-bg-200 shadow-lg transition-transform duration-300 ease-out
                    md:w-96 w-full h-full
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
                aria-modal="true"
                role="dialog"
            >
                {/* Header - Different on mobile vs desktop */}
                <div className="flex items-center justify-between p-4 border-b border-bg-300">
                    <div className="flex items-center">
                        {/* Back button (mobile only) */}
                        <button 
                        onClick={onClose}
                        className="md:hidden mr-3 text-text-200 hover:text-accent-200"
                        aria-label="Back"
                        >
                        <IoArrowBack size={24} />
                        </button>
                        
                        {/* Title */}
                        <h2 className="text-lg font-semibold text-text-200">{title}</h2>
                    </div>
                
                    {/* Close button (desktop only) */}
                    <button 
                        onClick={onClose}
                        className="hidden md:block text-text-200 hover:text-accent-200"
                        aria-label="Close"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                {children}
                </div>
            </div>
        </div>
    );
};

export default RightModalLayer;