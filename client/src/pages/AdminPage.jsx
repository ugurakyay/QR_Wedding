import { useState, useEffect } from 'react';
import AdminLogin from '../components/AdminLogin.jsx';
import AdminMediaList from '../components/AdminMediaList.jsx';
import { isAdminAuthenticated, logoutAdmin } from '../api/admin.js';
import { useMedia } from '../hooks/useMedia.js';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(isAdminAuthenticated());
  const { media, loading, error, loadMedia, setMedia } = useMedia(authenticated);

  useEffect(() => {
    setAuthenticated(isAdminAuthenticated());
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return (
      <div className="page-container flex min-h-[60vh] items-center">
        <div className="w-full">
          <AdminLogin onSuccess={() => setAuthenticated(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-wedding-gold">
            Yönetici
          </p>
          <h1 className="mt-1 font-serif text-3xl italic text-wedding-charcoal">
            Yüklemeleri Yönet
          </h1>
          <p className="mt-1 text-sm text-wedding-muted">
            {loading ? 'Yükleniyor…' : `${media.length} dosya`}
          </p>
        </div>
        <button type="button" onClick={handleLogout} className="btn-secondary self-start">
          Çıkış Yap
        </button>
      </header>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-wedding-blush" />
          ))}
        </div>
      ) : (
        <AdminMediaList
          media={media}
          onRefresh={loadMedia}
          onMediaChange={setMedia}
        />
      )}
    </div>
  );
}