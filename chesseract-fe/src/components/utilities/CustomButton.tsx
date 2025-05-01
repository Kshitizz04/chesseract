interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    onCLick?: () => void;
    className?: string;
}
const Button = ({ children, onCLick, className, ...props }: ButtonProps) => {
    return (
        <button onClick={onCLick} {...props}
            className={`p-2 cursor-pointer w-full rounded-sm hover:text-accent-200 bg-bg-300
                ${className}
            `}
        >
            {children}
        </button>
    )
}

export default Button