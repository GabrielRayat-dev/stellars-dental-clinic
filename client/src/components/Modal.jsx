import React from 'react';
import { X } from 'lucide-react';
import '../styles/Modal.css';

const Modal = ({ title, onClose, children }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal__header">
        <h2 className="modal__title">{title}</h2>
        <button className="modal__close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Modal;
