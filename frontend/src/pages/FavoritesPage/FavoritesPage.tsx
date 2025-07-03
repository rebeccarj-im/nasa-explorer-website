import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer';
import './FavoritesPage.css';

interface ImageData {
  title: string;
  url: string;
  explanation?: string;
  date?: string;
}

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<ImageData[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const removeFromFavorites = (title: string) => {
    const updated = favorites.filter(img => img.title !== title);
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  return (
    <div className="home-page">
      <Header/>

      <div className="search-results">
        <h2>Your Favorites</h2>

        {favorites.length === 0 ? (
          <p>No favorite images saved yet.</p>
        ) : (
          <div className="search-grid">
            {favorites.map((img, i) => (
              <div key={i} className="search-card">
                <img src={img.url} alt={img.title} />
                <div className="favorite-searched-card-caption">{img.title}</div>
                <button
                  className="unfavorite-btn"
                  onClick={() => removeFromFavorites(img.title)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default FavoritesPage;
