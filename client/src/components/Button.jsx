import React from 'react';
import '../styles/Button.css';

const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  onClick, 
  disabled = false,
  className = '',
  style,
  ...props 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`custom-btn ${variant} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
