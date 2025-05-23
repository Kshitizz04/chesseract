import { useState } from 'react';
import Button from '../utilities/CustomButton';

interface ConfirmationModalProps {
    onClose: () => void;
    onConfirm?: ()=>void;
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
    passwordRequired?: boolean;
    onPasswordRequired?: (password: string) => void;
}

const ConfirmationModal = ({
    onClose,
    onConfirm,
    title,
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDangerous = false,
    passwordRequired = false,
    onPasswordRequired,
}: ConfirmationModalProps) => {
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleConfirm = async () => {
        if(!onConfirm) return;
        setIsLoading(true);
        setError('');

        try {
            await onConfirm();
            resetAndClose();
        } catch (err) {
            console.log("Error confirming, ",err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordConfirm = async () => {
        if (!onPasswordRequired) return;

        if (!password) {
            setError('Please enter your password');
            return;
        }
        setIsLoading(true);
        setError('');

        console.log("trying in modal")
        try {
            await onPasswordRequired(password);
            console.log("closing modal")
            resetAndClose();
        } catch (err) {
            console.log("Error confirming, ",err);
        } finally {
            setIsLoading(false);
        }
    }

    const resetAndClose = () => {
        setPassword('');
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="p-5 md:p-6 max-w-md w-full h-max bg-bg-200 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
                
                <div className="mb-6 text-center text-text-200">
                    <p>{message}</p>
                </div>
                
                {passwordRequired && (
                <div className="mb-6">
                    <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium">
                        Please enter your password to confirm
                    </label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2.5 bg-bg-100 border border-bg-300 text-text-100 rounded-lg focus:ring-accent-100 focus:border-accent-100"
                        placeholder="Your password"
                    />
                    {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                </div>
                )}
                
                <div className="flex gap-3 justify-center">
                    <Button
                        onClick={resetAndClose}
                        className="flex-1 bg-bg-300 hover:bg-bg-400 text-text-100"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={passwordRequired ? handlePasswordConfirm : handleConfirm}
                        bg={`${isDangerous ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient'}`}
                        className="flex-1 text-black hover:text-black hover:scale-[1.03] transition-transform"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;