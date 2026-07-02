import { useState } from 'react';
import { deleteMedia, getFreshDownloadUrl } from '../api/admin.js';
import { formatDate, formatFileSize, getFilenameFromKey } from '../utils/format.js';

export default function AdminMediaList({ media, onRefresh, onMediaChange }) {
  const [deleting, setDeleting] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (key) => {
    const filename = getFilenameFromKey(key);
    if (!window.confirm(`"${filename}" dosyasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;

    setDeleting(key);
    setError('');

    try {
      await deleteMedia(key);
      onMediaChange((prev) => prev.filter((item) => item.key !== key));
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
      let url = item.viewUrl;
      try {
        url = await getFreshDownloadUrl(item.key);
      } catch {
        // mevcut viewUrl ile devam et
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = getFilenameFromKey(item.key);
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
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-wedding-blush">
                  {item.type === 'video' ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg className="h-6 w-6 text-wedding-rose" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  ) : (
                    <img
                      src={item.viewUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-wedding-charcoal">
                    {getFilenameFromKey(item.key)}
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
                  onClick={() => handleDelete(item.key)}
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