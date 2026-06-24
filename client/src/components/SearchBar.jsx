import React from 'react';
import '../styles/SearchBar.css';

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <div className="sb-wrap">
      <input
        type="text"
        className="sb-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
