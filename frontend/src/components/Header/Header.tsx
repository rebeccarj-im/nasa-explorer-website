import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './header.css';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSelectedLibrary(params.get('lib') || 'All');
    setSearchQuery(params.get('q') || '');
  }, [location.search]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedLibrary) params.set('lib', selectedLibrary);
    navigate(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-inner">
        <h1 className="header-title">NASA × Oracle</h1>

        <div className="header-controls">
          <div className="search-group">
            <select
              className="library-select"
              value={selectedLibrary}
              onChange={e => setSelectedLibrary(e.target.value)}
            >
              <option value="All">All Libraries</option>
              <option value="Image Library">Image Library</option>
              <option value="EPIC">EPIC</option>
              <option value="APOD">APOD</option>
            </select>
            <input
              type="text"
              placeholder="Search for your card..."
              className="search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="menu-container" ref={menuRef}>
            <button
              className="menu-button"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(prev => !prev)}
            >
              &#9776;
            </button>
            {menuOpen && (
              <ul className="dropdown-menu">
                <li><button onClick={() => handleNavigate('/gallery/1')}>Image Library</button></li>
                <li><button onClick={() => handleNavigate('/gallery/2')}>EPIC</button></li>
                <li><button onClick={() => handleNavigate('/gallery/3')}>APOD</button></li>
                <li><button onClick={() => handleNavigate('/favorites')}>Favorites</button></li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
