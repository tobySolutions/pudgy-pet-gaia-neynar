interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  className = "", 
  isLoading = false, 
  variant = 'primary',
  size = 'md',
  ...props 
}: ButtonProps) {
  // If custom classes are provided (starting with !), use them as-is
  if (className.includes('!bg-gradient') || className.includes('!flex')) {
    return (
      <button
        className={className}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          children
        )}
      </button>
    );
  }

  const baseClasses = "btn";
  
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary", 
    outline: "btn-outline"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const fullWidthClasses = "w-full max-w-xs mx-auto block";
  
  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidthClasses,
    className
  ].join(' ');

  return (
    <button
      className={combinedClasses}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="spinner-primary h-5 w-5" />
        </div>
      ) : (
        children
      )}
    </button>
  );
}
