import { formatFileSize } from '../utils/format.js';

export default function FileList({ files, onRemove, disabled }) {
  if (files.length === 0) return null;

  return (
    <ul className="space-y-2">
      {files.map((file, index) => (
        <li
          key={`${file.name}-${file.size}-${index}`}
          className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-card"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-wedding-blush">
            {file.type.startsWith('video/') ? (
              <svg className="h-5 w-5 text-wedding-rose" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-wedding-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-wedding-charcoal">{file.name}</p>
            <p className="text-xs text-wedding-muted">{formatFileSize(file.size)}</p>
          </div>

          {!disabled && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="shrink-0 rounded-full p-1 text-wedding-muted transition hover:bg-wedding-blush hover:text-wedding-rose"
              aria-label={`Remove ${file.name}`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
