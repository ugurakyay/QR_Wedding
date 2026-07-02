import { Outlet, NavLink } from 'react-router-dom';

const coupleName = import.meta.env.VITE_COUPLE_NAME || 'Düğünümüz';

const navLinkClass = ({ isActive }) =>
  `text-xs font-semibold uppercase tracking-widest transition ${
    isActive
      ? 'text-wedding-rose'
      : 'text-wedding-muted hover:text-wedding-gold'
  }`;

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-wedding-blush/60 bg-white/90 backdrop-blur-sm">
        <div className="page-container flex items-center justify-between py-4">
          <NavLink to="/" className="font-serif text-xl italic text-wedding-charcoal sm:text-2xl">
            {coupleName}
          </NavLink>
          <nav className="flex items-center gap-5 sm:gap-8">
            <NavLink to="/" end className={navLinkClass}>
              Yükle
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-wedding-blush/60 py-8 text-center">
        <p className="font-serif italic text-wedding-muted">
          Her anı bizim için çok değerli ✦
        </p>
        <p className="mt-1 text-xs tracking-widest text-wedding-muted/60 uppercase">
          Gökçe & Uğur — 8 Ağustos 2026
        </p>
      </footer>
    </div>
  );
}