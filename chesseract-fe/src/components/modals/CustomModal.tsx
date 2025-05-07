import React, { FC, PropsWithChildren } from 'react';
import { IoClose } from 'react-icons/io5';

interface CommonModalLayerProps {
    children: React.ReactNode;
    onClose?: () => void;
}

const CustomModal: FC<PropsWithChildren<CommonModalLayerProps>> = ({
    children,
    onClose,
}) => {

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 text-200">
            <div className='relative bg-primary-100/90 rounded-sm shadow-sm shadow-accent-100 pt-8 h-96 w-96'>
                <button
                    onClick={onClose}
                    className="absolute top-1 right-1 text-text-100 hover:text-accent-200 transition duration-200 cursor-pointer"
                    aria-label="Close Modal"
                >
                    <IoClose size={30}/>
                </button>
                {children}
            </div>
        </div>
    );
};

export default CustomModal;