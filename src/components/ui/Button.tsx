interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'success' | 'icon' | 'secondary' | 'danger';
    children: React.ReactNode;
    size?: 'small' | 'normal';
  }
  
export const Button = ({ variant = 'primary', size = 'normal', children, className = '', disabled, ...props }: ButtonProps) => {
    const baseStyles = 'rounded transition duration-200 ease-in-out flex items-center justify-center gap-2 font-mono text-xs';
    const variants = {
        primary: `bg-gray-700 text-white hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 
        disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed`,
        success: `bg-gray-900 text-white hover:bg-black dark:bg-black dark:hover:bg-gray-900 
        disabled:bg-gray-400 dark:disabled:bg-gray-800 disabled:cursor-not-allowed`,
        icon: `bg-transparent text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 disabled:bg-transparent 
        disabled:text-gray-400`,
        secondary: `bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600
        disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed`,
        danger: `bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600
        disabled:bg-red-400 dark:disabled:bg-red-800 disabled:cursor-not-allowed`
    };
    const sizes = {
        small: 'px-3 py-1.5',
        normal: 'w-full px-4 py-2'
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled} {...props} >
            {children}
        </button>
    );
};