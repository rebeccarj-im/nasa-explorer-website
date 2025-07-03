import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer';
import './SearchedPage.css';

interface ImageData {
  title: string;
  url: string;
  explanation?: string;
  date?: string;
}
const API_BASE = import.meta.env.VITE_API_URL;

const SearchedPage: React.FC = () => {
  const [results, setResults] = useState<ImageData[]>([]);
  const [favorites, setFavorites] = useState<ImageData[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const lib = params.get('lib') || 'All';
  const q = params.get('q')?.toLowerCase() || '';

  useEffect(() => {
    const fetchAll = async () => {
      const endpoints = [
        `${API_BASE}/api/card1`,
        `${API_BASE}/api/card2`,
        `${API_BASE}/api/card3`
      ];
      const responses = await Promise.all(endpoints.map(ep => fetch(ep).then(res => res.json())));
      const all = responses.flat();

      const filtered = lib === 'All'
        ? all
        : responses[['Image Library', 'EPIC', 'APOD'].indexOf(lib)] || [];

      const matched = filtered.filter((img: ImageData) =>
        img.title.toLowerCase().includes(q)
      );

      setResults(matched.slice(0, 30));
    };

    fetchAll();

    const stored = localStorage.getItem('favorites');
    if (stored) setFavorites(JSON.parse(stored));
  }, [lib, q]);

  const toggleFavorite = (img: ImageData) => {
    const isFav = favorites.some(f => f.url === img.url);
    const updated = isFav
      ? favorites.filter(f => f.url !== img.url)
      : [...favorites, img];

    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const isFavorite = (img: ImageData) => favorites.some(f => f.url === img.url);

  return (
    <div className="home-page">
      <Header />

      
      <button className="back-button" onClick={() => navigate(-1)}>&larr;</button>

      <div className="search-results">
        <h2>Search Results</h2>
        <div className="search-grid">
          {results.map((img, i) => (
            <div key={i} className="search-card">
              <img src={img.url} alt={img.title} />
              <button
                className={`favorite-btn ${isFavorite(img) ? 'active' : ''}`}
                onClick={() => toggleFavorite(img)}
                title="Toggle Favorite"
                dangerouslySetInnerHTML={{ __html: isFavorite(img) ? '&#9733;' : '&#9734;' }}
              />
              <div className="searched-card-caption">{img.title}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchedPage;
