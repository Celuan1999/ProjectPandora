export enum ColorTypes {
    primary = "primary",
    secondary = "secondary"
}

interface ButtonProps {
    children: React.ReactNode;
    color?: ColorTypes;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

export default function Button({ 
    children, 
    color = ColorTypes.primary, 
    onClick,
    className = "",
    disabled = false
}: ButtonProps) {

    const colors = {    
        primary: "bg-[var(--custom-black)] hover:bg-black text-white",
        secondary: "bg-[var(--custom-gray)] border border-[var(--custom-gray-border)] hover:bg-gray-300 text-black",
    }

    return (
        <button 
            className={`px-4 py-1 text-sm rounded-lg cursor-pointer ${colors[color]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}