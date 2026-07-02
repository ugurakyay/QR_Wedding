import { useState } from 'react';
import MasonryGrid from '../components/MasonryGrid.jsx';
import MediaModal from '../components/MediaModal.jsx';
import { useMedia } from '../hooks/useMedia.js';

export default function GalleryPage() {
  const { media, loading, error, loadMedia } = useMedia();
  const [selected, setSelected] = useState(null);

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

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-500">
          {error}
          <button
            type="button"
            onClick={loadMedia}
            className="ml-2 font-semibold underline"
          >
            Tekrar dene
          </button>
        </div>
      )}

      {loading ? (
        <div className="columns-2 gap-3 sm:columns-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="mb-3 h-48 animate-pulse break-inside-avoid rounded-xl bg-wedding-blush sm:mb-4"
            />
          ))}
        </div>
      ) : (
        <MasonryGrid media={media} onItemClick={setSelected} />
      )}

      {selected && (
        <MediaModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}