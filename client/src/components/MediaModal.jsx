import { useEffect } from 'react';

export default function MediaModal({ item, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  if (!item) return null;

  const isVideo = item.type === 'video';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
        aria-label="Close"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative max-h-[90vh] max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            src={item.viewUrl}
            controls
            autoPlay
            playsInline
            className="max-h-[85vh] max-w-full rounded-lg"
          />
        ) : (
          <img
            src={item.viewUrl}
            alt="Wedding memory"
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
          />
        )}
      </div>
    </div>
  );
}
