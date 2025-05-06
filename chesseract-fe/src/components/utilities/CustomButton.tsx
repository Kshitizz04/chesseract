interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    onCLick?: () => void;
    className?: string;
    width?: string;
    height?: string;
}
const Button = ({ children, onCLick, className,width="w-full", ...props }: ButtonProps) => {
    return (
        <button onClick={onCLick} {...props}
            className={`p-2 cursor-pointer rounded-sm hover:text-accent-200 bg-bg-300 flex items-center justify-center
                ${className}
                ${width}
            `}
        >
            {children}
        </button>
    )
}

export default Button