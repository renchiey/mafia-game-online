import { createPortal } from "react-dom";

interface LeaveModalProps {
  onLeave: () => void;
  onCancel: () => void;
}

export function LeaveModal({ onLeave, onCancel }: LeaveModalProps) {
  return (
    <>
      {createPortal(
        <div className="leave-modal-container">
          <h3>Are you sure you want to leave?</h3>
          <div className="leave-modal-btn-container">
            <button className="leave-modal-btn" onClick={onLeave}>
              Yes
            </button>
            <button className="leave-modal-btn" onClick={onCancel}>
              No
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
