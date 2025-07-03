import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import GalleryPage from './pages/GalleryPage/GalleryPage';
import SearchedPage from './pages/SearchedPage/SearchedPage';
import FavoritesPage from './pages/FavoritesPage/FavoritesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/gallery/:id" element={<GalleryPage />} />
        <Route path="/search" element={<SearchedPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
