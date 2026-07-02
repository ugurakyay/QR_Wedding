export default function SuccessScreen({ count, onUploadMore }) {
  return (
    <div className="animate-slide-up py-12 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-wedding-blush">
        <svg className="h-10 w-10 text-wedding-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="font-serif text-4xl italic text-wedding-charcoal sm:text-5xl">
        Teşekkürler!
      </h2>

      <div className="ornament mx-auto mt-4 max-w-[10rem]">
        <span className="text-wedding-gold text-sm">✦</span>
      </div>

      <p className="mt-4 text-wedding-muted">
        {count === 1
          ? 'Anınız başarıyla paylaşıldı.'
          : `${count} anınız başarıyla paylaşıldı.`}
      </p>

      <div className="mt-10 flex justify-center">
        <button type="button" onClick={onUploadMore} className="btn-primary">
          Daha Fazla Yükle
        </button>
      </div>
    </div>
  );
}