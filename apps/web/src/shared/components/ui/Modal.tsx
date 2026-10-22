import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg flex flex-col">
        <div className="flex items-start justify-between p-4 border-b rounded-t">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4 flex-1">
          {children}
        </div>
        {footer && (
          <div className="flex items-center p-4 border-t border-gray-200 rounded-b gap-2 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
