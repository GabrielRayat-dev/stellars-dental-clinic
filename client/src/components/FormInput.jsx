import React from 'react';
import '../styles/FormInput.css';

const FormInput = ({
  label,
  type = 'text',
  id,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  footerLinkText,
  footerLinkHref = '#',
  onFooterLinkClick,
  ...props
}) => {
  return (
    <div className="form-input-container">
      {label && (
        <label htmlFor={id} className="form-input-label">
          {label}
        </label>
      )}
      
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`form-text-input ${error ? 'has-error' : ''}`}
        {...props}
      />

      <div className="form-input-footer">
        {error ? (
          <span className="form-input-error-text">{error}</span>
        ) : (
          <span />
        )}
        
        {footerLinkText && (
          <a
            href={footerLinkHref}
            onClick={(e) => {
              if (onFooterLinkClick) {
                e.preventDefault();
                onFooterLinkClick();
              }
            }}
            className="form-input-footer-link"
          >
            {footerLinkText}
          </a>
        )}
      </div>
    </div>
  );
};

export default FormInput;
