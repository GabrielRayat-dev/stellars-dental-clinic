import React from 'react';
import * as LucideIcons from 'lucide-react';
import '../styles/ButtonWithIcons.css';

const ButtonWithIcons = ({ 
  iconName, 
  label, 
  active, 
  onClick, 
  className = '',
  variant = 'default',   // 'default' | 'gold' | 'danger'
  disabled = false,
  type = 'button'
}) => {
  const Icon = iconName ? LucideIcons[iconName] : null;
  
  return (
    <button 
      className={`bwi-btn bwi-btn--${variant} ${active ? 'bwi-btn--active' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {Icon && <Icon size={16} className="bwi-icon" />}
      {label}
    </button>
  );
};

export default ButtonWithIcons;
