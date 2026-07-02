import MediaCard from './MediaCard.jsx';

export default function MasonryGrid({ media, onItemClick }) {
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
    <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4">
      {media.map((item) => (
        <MediaCard key={item.key} item={item} onClick={onItemClick} />
      ))}
    </div>
  );
}