// Modal.js
import { CrossIcon } from '@components/icons';
import { ComponentProps, MouseEventHandler } from 'react';

interface ModalProps extends ComponentProps<'div'> {
  isOpen: boolean;
  onClose: MouseEventHandler<HTMLButtonElement>;
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-70 p-6">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg max-w-[32rem] max-h-full w-full relative overflow-scroll">
        <button
          className="absolute right-6 top-6 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <CrossIcon />
        </button>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Modal;
