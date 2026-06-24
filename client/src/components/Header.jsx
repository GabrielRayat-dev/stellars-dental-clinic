import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/Header.css';

const Header = ({ title, subtitle, onBack, onForward }) => {
  return (
    <div className="header">
      {onBack ? (
        <button className="header__nav-btn" onClick={onBack}>
          <ChevronLeft size={20} />
        </button>
      ) : (
        <div style={{ width: '36px' }} />
      )}
      
      <div className="header__text">
        <h1 className="header__title">{title}</h1>
        {subtitle && <p className="header__subtitle">{subtitle}</p>}
      </div>

      {onForward ? (
        <button className="header__nav-btn" onClick={onForward}>
          <ChevronRight size={20} />
        </button>
      ) : (
        <div style={{ width: '36px' }} />
      )}
    </div>
  );
};

export default Header;
