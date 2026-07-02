export default function UploadProgress({ progress, currentFile, totalFiles, currentIndex }) {
  return (
    <div className="animate-fade-in rounded-2xl bg-white p-6 shadow-soft">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium text-wedding-charcoal">
          {totalFiles > 1
            ? `Yükleniyor (${currentIndex + 1} / ${totalFiles})…`
            : 'Yükleniyor…'}
        </span>
        <span className="font-semibold text-wedding-rose">{progress}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-wedding-blush">
        <div
          className="h-full rounded-full bg-gradient-to-r from-wedding-rose to-wedding-gold transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentFile && (
        <p className="mt-3 truncate text-xs text-wedding-muted">{currentFile}</p>
      )}
    </div>
  );
}