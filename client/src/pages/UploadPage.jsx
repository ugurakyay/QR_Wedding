import { useEffect } from 'react';
import UploadZone from '../components/UploadZone.jsx';
import UploadProgress from '../components/UploadProgress.jsx';
import SuccessScreen from '../components/SuccessScreen.jsx';
import FileList from '../components/FileList.jsx';
import { useUpload } from '../hooks/useUpload.js';

const coupleName = import.meta.env.VITE_COUPLE_NAME || 'Gökçe & Uğur';
const weddingDate = import.meta.env.VITE_WEDDING_DATE || '';

export default function UploadPage() {
  const {
    config,
    files,
    uploading,
    progress,
    currentFile,
    currentIndex,
    errors,
    completed,
    uploadedCount,
    loadConfig,
    addFiles,
    removeFile,
    clearFiles,
    startUpload,
  } = useUpload();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  if (completed) {
    return (
      <div className="page-container">
        <SuccessScreen count={uploadedCount} onUploadMore={clearFiles} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="mb-10 text-center sm:mb-14">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wedding-gold">
          Anılarınızı Paylaşın
        </p>
        <h1 className="mt-3 font-serif text-5xl italic text-wedding-charcoal sm:text-6xl md:text-7xl">
          {coupleName}
        </h1>

        <div className="ornament mx-auto mt-5 max-w-xs">
          <span className="text-wedding-gold">✦</span>
        </div>

        {weddingDate && (
          <p className="mt-4 font-serif text-lg italic text-wedding-muted sm:text-xl">
            {weddingDate}
          </p>
        )}

        <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-wedding-muted">
          O özel günün en güzel anlarını bizimle paylaşın.
          Her fotoğraf ve video bu günü sonsuza dek yaşatacak.
        </p>
      </header>

      <div className="mx-auto max-w-lg space-y-5">
        {uploading ? (
          <UploadProgress
            progress={progress}
            currentFile={currentFile}
            totalFiles={files.length}
            currentIndex={currentIndex}
          />
        ) : (
          <>
            <UploadZone
              onFilesSelected={addFiles}
              disabled={uploading}
              maxFileSize={config?.maxFileSize}
            />

            <FileList files={files} onRemove={removeFile} disabled={uploading} />

            {errors.length > 0 && (
              <div className="rounded-xl bg-red-50 px-4 py-3">
                <ul className="space-y-1 text-sm text-red-500">
                  {errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {files.length > 0 && (
              <button
                type="button"
                onClick={startUpload}
                className="btn-primary w-full"
              >
                {files.length === 1 ? '1 Dosyayı Yükle' : `${files.length} Dosyayı Yükle`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}