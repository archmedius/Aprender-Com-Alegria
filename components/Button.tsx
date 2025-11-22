import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "rounded-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-[4px] flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-sanda-primary text-sanda-dark hover:brightness-110",
    secondary: "bg-sanda-secondary text-white hover:brightness-110",
    success: "bg-sanda-accent text-white hover:brightness-110",
    outline: "bg-white border-4 border-sanda-primary text-sanda-dark hover:bg-gray-50",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-xl",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;