import { useRef } from 'react';
import { formatFileSize } from '../utils/format.js';

export default function UploadZone({ onFilesSelected, disabled, maxFileSize }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    if (e.target.files?.length) {
      onFilesSelected(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files?.length) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`group cursor-pointer rounded-2xl border-2 border-dashed border-wedding-rose/40 bg-white p-8 text-center transition hover:border-wedding-rose hover:bg-wedding-blush/20 sm:p-12 ${
        disabled ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-wedding-blush transition group-hover:bg-wedding-rose/20">
        <svg className="h-8 w-8 text-wedding-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <p className="font-serif text-xl italic text-wedding-charcoal sm:text-2xl">
        Fotoğraf ve video seçin
      </p>
      <p className="mt-2 text-sm text-wedding-muted">
        veya buraya sürükleyip bırakın
      </p>
      {maxFileSize && (
        <p className="mt-2 text-xs text-wedding-muted/70">
          Dosya başına maksimum {formatFileSize(maxFileSize)}
        </p>
      )}
    </div>
  );
}