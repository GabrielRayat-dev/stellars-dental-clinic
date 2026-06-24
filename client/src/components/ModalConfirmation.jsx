import React from 'react';
import { AlertTriangle } from 'lucide-react';
import '../styles/ModalConfirmation.css';

/**
 * ModalConfirmation
 * 
 * Props:
 *  - title       {string}    – Bold heading text
 *  - message     {string}    – Body message / summary text
 *  - onConfirm   {function}  – Called when the user clicks Confirm
 *  - onCancel    {function}  – Called when the user clicks Cancel or the overlay
 *  - confirmText {string}    – (optional) Label for confirm button, default "Confirm"
 *  - cancelText  {string}    – (optional) Label for cancel button, default "Cancel"
 *  - loading     {boolean}   – (optional) Disables confirm and shows spinner
 *  - danger      {boolean}   – (optional) Makes the confirm button red for destructive actions
 */
const ModalConfirmation = ({
  title = 'Are you sure?',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  danger = false,
}) => (
  <div className="mc-overlay" onClick={onCancel}>
    <div className="mc-modal" onClick={(e) => e.stopPropagation()}>
      <div className="mc-icon-wrap">
        <AlertTriangle size={32} className="mc-icon" />
      </div>

      <h2 className="mc-title">{title}</h2>
      {message && <p className="mc-message">{message}</p>}

      <div className="mc-actions">
        <button className="mc-btn mc-btn--cancel" onClick={onCancel} disabled={loading}>
          {cancelText}
        </button>
        <button className={`mc-btn ${danger ? 'mc-btn--danger' : 'mc-btn--confirm'}`} onClick={onConfirm} disabled={loading}>
          {loading ? 'Processing…' : confirmText}
        </button>
      </div>
    </div>
  </div>
);

export default ModalConfirmation;
