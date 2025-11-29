import React from 'react';
import './ConfirmModal.css';

interface ConfirmModalProps {
    open: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
                                                       open,
                                                       title = 'Confirm action',
                                                       message,
                                                       confirmLabel = 'Confirm',
                                                       cancelLabel = 'Cancel',
                                                       onConfirm,
                                                       onCancel,
                                                   }) => {
    if (!open) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3 className="modal__title">{title}</h3>
                <p className="modal__message">{message}</p>
                <div className="modal__buttons">
                    <button
                        className="btn btn--secondary"
                        type="button"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className="btn btn--danger"
                        type="button"
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
