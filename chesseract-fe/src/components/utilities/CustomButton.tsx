interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    onCLick?: () => void;
    className?: string;
    width?: string;
    height?: string;
    bg?: string;
}
const Button = ({ children, onCLick, className,width="w-full", bg="bg-bg-300", ...props }: ButtonProps) => {
    return (
        <button onClick={onCLick} {...props}
            className={`p-2 cursor-pointer rounded-sm hover:text-accent-200 flex items-center justify-center
                ${className}
                ${width}
                ${bg}
            `}
        >
            {children}
        </button>
    )
}

export default Button