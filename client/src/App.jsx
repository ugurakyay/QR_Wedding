import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import UploadPage from './pages/UploadPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<UploadPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}
