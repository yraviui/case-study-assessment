import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RiCloseLine } from 'react-icons/ri';

const Popup = ({ isOpen, onClose, title, children }) => {

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Full Browser Lightbox Overlay */}
      <div
        className="fixed inset-0 z-[9998] w-screen h-screen bg-black/50"
        onClick={onClose}
      />

      {/* Right Side Full-Height Drawer */}
      <aside
        className="fixed top-0 right-0 z-[9999]
          w-full sm:w-[80%] lg:w-[60%] xl:w-[45%]
          h-screen bg-white shadow-2xl
          flex flex-col
          animate-slideInRight"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between
          px-6 py-5 border-b border-gray-100 shrink-0">

          <h2 className="text-lg font-bold text-gray-900 truncate">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500
              hover:bg-gray-100 hover:text-red-500"
            aria-label="Close popup"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-gray-50/50">
          {children}
        </div>
      </aside>
    </>,
    document.body
  );
};

export default Popup;