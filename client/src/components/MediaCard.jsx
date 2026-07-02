import LazyImage from './LazyImage.jsx';

export default function MediaCard({ item, onClick }) {
  const isVideo = item.type === 'video';

  return (
    <article
      className="group mb-3 break-inside-avoid overflow-hidden rounded-xl bg-white shadow-card transition hover:shadow-soft sm:mb-4"
    >
      {isVideo ? (
        <div className="relative cursor-pointer" onClick={() => onClick(item)}>
          <video
            src={item.viewUrl}
            preload="metadata"
            muted
            playsInline
            className="w-full object-cover"
            onLoadedData={(e) => {
              e.target.currentTime = 0.5;
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-soft">
              <svg className="ml-1 h-5 w-5 text-wedding-rose" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <LazyImage
          src={item.viewUrl}
          alt="Wedding memory"
          onClick={() => onClick(item)}
          className="cursor-pointer"
        />
      )}
    </article>
  );
}
