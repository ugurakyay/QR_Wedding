import { formatDate } from '../utils/format.js';

export default function MediaLog({ media, onItemClick, loadingKey }) {
  if (media.length === 0) {
    return (
      <div className="rounded-2xl bg-white py-20 text-center shadow-soft">
        <p className="font-serif text-2xl italic text-wedding-charcoal">
          Henüz anı paylaşılmadı
        </p>
        <p className="mt-3 text-sm text-wedding-muted">
          İlk fotoğrafı paylaşan sen ol!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
      <ul className="divide-y divide-wedding-blush">
        {media.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={() => onItemClick(item)}
              disabled={loadingKey === item.key}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-wedding-blush/30 disabled:opacity-60"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wedding-blush">
                {item.type === 'video' ? (
                  <svg className="h-4 w-4 text-wedding-rose" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-wedding-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-wedding-charcoal">
                  {item.uploaderName}
                </p>
                <p className="text-xs text-wedding-muted">{formatDate(item.lastModified)}</p>
              </div>

              <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-wedding-gold">
                {loadingKey === item.key ? '…' : 'Görüntüle'}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
