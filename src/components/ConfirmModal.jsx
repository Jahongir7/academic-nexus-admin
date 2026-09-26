import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = "O'chirishni tasdiqlang", message, loading = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          {message || "Siz haqiqatan ham ushbu ma'lumotni o'chirib tashlamoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi."}
        </p>

        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="admin-btn-secondary w-1/2 justify-center"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="admin-btn-danger w-1/2 justify-center"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "O'chirish"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
