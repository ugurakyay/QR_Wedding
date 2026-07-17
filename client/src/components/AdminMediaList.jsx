import { useState } from 'react';
import { deleteMedia, getFreshDownloadUrl } from '../api/admin.js';
import { formatDate, formatFileSize, getKeyExtension } from '../utils/format.js';

export default function AdminMediaList({ media, onRefresh, onMediaChange }) {
  const [deleting, setDeleting] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (item) => {
    if (!window.confirm(`"${item.uploaderName}" tarafından yüklenen dosyayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;

    setDeleting(item.key);
    setError('');

    try {
      await deleteMedia(item.key);
      onMediaChange((prev) => prev.filter((m) => m.key !== item.key));
    } catch (err) {
      setError(err.response?.data?.error || 'Dosya silinemedi');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (item) => {
    setDownloading(item.key);
    setError('');

    try {
      const url = await getFreshDownloadUrl(item.key);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.uploaderName.replace(/\s+/g, '_')}.${getKeyExtension(item.key)}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.response?.data?.error || 'Dosya indirilemedi');
    } finally {
      setDownloading(null);
    }
  };

  if (media.length === 0) {
    return (
      <div className="rounded-2xl bg-white py-16 text-center shadow-soft">
        <p className="font-serif italic text-wedding-muted">Henüz yükleme yok.</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
        <ul className="divide-y divide-wedding-blush">
          {media.map((item) => (
            <li key={item.key} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-wedding-blush">
                  {item.type === 'video' ? (
                    <svg className="h-6 w-6 text-wedding-rose" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-wedding-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-wedding-charcoal">
                    {item.uploaderName}
                  </p>
                  <p className="text-xs text-wedding-muted">
                    {formatFileSize(item.size)} · {formatDate(item.lastModified)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2 sm:ml-4">
                <button
                  type="button"
                  onClick={() => handleDownload(item)}
                  disabled={downloading === item.key}
                  className="btn-secondary px-4 py-2 text-xs"
                >
                  {downloading === item.key ? '…' : 'İndir'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  disabled={deleting === item.key}
                  className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-400 transition hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting === item.key ? '…' : 'Sil'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 text-center">
        <button type="button" onClick={onRefresh} className="text-sm text-wedding-gold hover:underline">
          Listeyi yenile
        </button>
      </div>
    </div>
  );
}