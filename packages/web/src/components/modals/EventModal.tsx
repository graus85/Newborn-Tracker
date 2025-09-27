import React from "react";

const EventModal: React.FC<{ open?: boolean; onClose?: () => void }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default EventModal;
