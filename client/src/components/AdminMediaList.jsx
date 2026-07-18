import { useState, useEffect } from 'react';
import { deleteMedia, getFreshDownloadUrl } from '../api/admin.js';
import { formatDate, formatFileSize } from '../utils/format.js';
import { createZipBlob, buildZipEntryNames } from '../utils/zip.js';

// No target="_blank" here on purpose: the URLs either carry a
// Content-Disposition: attachment header (S3) or a download attribute
// (blob zips), so a same-tab click saves the file without navigating.
// A programmatic _blank click after an await gets eaten by popup
// blockers in real Safari/Chrome, which made downloads silently no-op.
function triggerDownload(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  if (filename) link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function isSessionExpired(err) {
  return err.response?.status === 401;
}

function getErrorMessage(err, fallback) {
  if (isSessionExpired(err)) {
    return 'Oturumunuz sona ermiş. Çıkış yapıp tekrar giriş yapın.';
  }
  return err.response?.data?.error || fallback;
}

export default function AdminMediaList({ media, onRefresh, onMediaChange }) {
  const [deleting, setDeleting] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [bulkDownloading, setBulkDownloading] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const validKeys = new Set(media.map((item) => item.key));
    setSelected((prev) => {
      const next = new Set([...prev].filter((key) => validKeys.has(key)));
      return next.size === prev.size ? prev : next;
    });
  }, [media]);

  const allSelected = media.length > 0 && selected.size === media.length;

  const toggleOne = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(media.map((item) => item.key)));
  };

  const toggleGroup = (group) => {
    const keys = group.items.map((item) => item.key);
    const allInGroup = keys.every((key) => selected.has(key));
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => (allInGroup ? next.delete(key) : next.add(key)));
      return next;
    });
  };

  // Group rows per uploader, keeping the newest-first order of `media`
  const groups = [];
  {
    const byName = new Map();
    for (const item of media) {
      let group = byName.get(item.uploaderName);
      if (!group) {
        group = { name: item.uploaderName, items: [] };
        byName.set(item.uploaderName, group);
        groups.push(group);
      }
      group.items.push(item);
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`"${item.uploaderName}" tarafından yüklenen dosyayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;

    setDeleting(item.key);
    setError('');

    try {
      await deleteMedia(item.key);
      onMediaChange((prev) => prev.filter((m) => m.key !== item.key));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(item.key);
        return next;
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Dosya silinemedi'));
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (item) => {
    setDownloading(item.key);
    setError('');

    try {
      const url = await getFreshDownloadUrl(item.key);
      triggerDownload(url);
    } catch (err) {
      setError(getErrorMessage(err, 'Dosya indirilemedi'));
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadSelected = async () => {
    const items = media.filter((item) => selected.has(item.key));
    if (items.length === 0) return;

    setBulkDownloading({ index: 0, total: items.length });
    setError('');

    try {
      const names = buildZipEntryNames(items);
      const urls = await Promise.all(items.map((item) => getFreshDownloadUrl(item.key)));
      const entries = items.map((item, i) => ({ url: urls[i], name: names[i] }));

      const blob = await createZipBlob(entries, (index, total) => setBulkDownloading({ index, total }));
      const url = URL.createObjectURL(blob);
      triggerDownload(url, `secilen-dosyalar-${items.length}.zip`);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err, 'Dosyalar zip olarak indirilemedi'));
    } finally {
      setBulkDownloading(null);
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

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={toggleAll}
          className="text-sm font-semibold text-wedding-gold hover:underline"
        >
          {allSelected ? 'Seçimi Kaldır' : 'Tümünü Seç'}
        </button>

        {selected.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-wedding-muted">{selected.size} seçili</span>
            <button
              type="button"
              onClick={handleDownloadSelected}
              disabled={bulkDownloading !== null}
              className="btn-secondary px-4 py-2 text-xs"
            >
              {bulkDownloading
                ? `Hazırlanıyor (${bulkDownloading.index + 1}/${bulkDownloading.total})…`
                : 'Seçilenleri İndir (ZIP)'}
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
        {groups.map((group) => (
          <div key={group.name} className="border-b border-wedding-blush last:border-b-0">
            <div className="flex items-center gap-3 bg-wedding-blush/40 px-4 py-3">
              <input
                type="checkbox"
                checked={group.items.every((item) => selected.has(item.key))}
                onChange={() => toggleGroup(group)}
                aria-label={`${group.name} klasörünü seç`}
                className="h-4 w-4 shrink-0 accent-wedding-rose"
              />
              <svg className="h-5 w-5 shrink-0 text-wedding-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="min-w-0 truncate text-sm font-semibold text-wedding-charcoal">
                {group.name}
              </p>
              <p className="ml-auto shrink-0 text-xs text-wedding-muted">
                {group.items.length} dosya · {formatFileSize(group.items.reduce((sum, item) => sum + item.size, 0))}
              </p>
            </div>

            <ul className="divide-y divide-wedding-blush/60">
              {group.items.map((item) => (
                <li key={item.key} className="flex flex-col gap-3 py-3 pl-8 pr-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selected.has(item.key)}
                      onChange={() => toggleOne(item.key)}
                      aria-label={`${item.uploaderName} dosyasını seç`}
                      className="h-4 w-4 shrink-0 accent-wedding-rose"
                    />

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-wedding-blush">
                      {item.type === 'video' ? (
                        <svg className="h-5 w-5 text-wedding-rose" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-wedding-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-wedding-charcoal">
                        {item.type === 'video' ? 'Video' : 'Fotoğraf'} · {formatFileSize(item.size)}
                      </p>
                      <p className="text-xs text-wedding-muted">{formatDate(item.lastModified)}</p>
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
        ))}
      </div>

      <div className="mt-4 text-center">
        <button type="button" onClick={onRefresh} className="text-sm text-wedding-gold hover:underline">
          Listeyi yenile
        </button>
      </div>
    </div>
  );
}