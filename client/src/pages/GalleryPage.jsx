import { useState } from 'react';
import MediaLog from '../components/MediaLog.jsx';
import MediaModal from '../components/MediaModal.jsx';
import { useMedia } from '../hooks/useMedia.js';
import { getMediaViewUrl } from '../api/media.js';

export default function GalleryPage() {
  const { media, loading, error, loadMedia } = useMedia();
  const [selected, setSelected] = useState(null);
  const [loadingKey, setLoadingKey] = useState(null);
  const [viewError, setViewError] = useState('');

  const handleItemClick = async (item) => {
    setLoadingKey(item.key);
    setViewError('');
    try {
      const viewUrl = await getMediaViewUrl(item.key);
      setSelected({ ...item, viewUrl });
    } catch {
      setViewError('Dosya açılamadı, tekrar deneyin.');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="page-container">
      <header className="mb-10 text-center sm:mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wedding-gold">
          Fotoğraf Galerisi
        </p>
        <h1 className="mt-3 font-serif text-4xl italic text-wedding-charcoal sm:text-5xl">
          Paylaşılan Anlar
        </h1>
        <div className="ornament mx-auto mt-4 max-w-[10rem]">
          <span className="text-wedding-gold text-sm">✦</span>
        </div>
        <p className="mt-4 text-sm text-wedding-muted">
          {loading
            ? 'Yükleniyor…'
            : media.length === 0
            ? ''
            : `${media.length} anı paylaşıldı`}
        </p>
      </header>

      {(error || viewError) && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-500">
          {error || viewError}
          {error && (
            <button
              type="button"
              onClick={loadMedia}
              className="ml-2 font-semibold underline"
            >
              Tekrar dene
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-wedding-blush" />
          ))}
        </div>
      ) : (
        <MediaLog media={media} onItemClick={handleItemClick} loadingKey={loadingKey} />
      )}

      {selected && (
        <MediaModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}