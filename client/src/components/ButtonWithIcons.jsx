import React from 'react';
import * as LucideIcons from 'lucide-react';
import '../styles/ButtonWithIcons.css';

const ButtonWithIcons = ({ iconName, label, active, onClick, className = '' }) => {
  const Icon = iconName ? LucideIcons[iconName] : null;
  
  return (
    <button 
      className={`bwi-btn ${active ? 'bwi-btn--active' : ''} ${className}`}
      onClick={onClick}
      type="button"
    >
      {Icon && <Icon size={16} className="bwi-icon" />}
      {label}
    </button>
  );
};

export default ButtonWithIcons;
