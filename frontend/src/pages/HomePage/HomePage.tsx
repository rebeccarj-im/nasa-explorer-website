import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import HomeCard3D from '../../components/HomeCard/HomeCard3D';
import Footer from '../../components/Footer';
import './HomePage.css';

interface ImageData {
  title: string;
  url: string;
  explanation?: string;
  date?: string;
}

const apiNames = ['Image Library', 'EPIC', 'APOD'];

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [images, setImages] = useState<ImageData[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cardSpacing, setCardSpacing] = useState<number>(4);


  const rotations: [number, number, number][] = [
    [0.08, -0.4, 0.3],
    [0, 1.2, 0.7],
    [-0.1, 0.35, -0.7],
  ];

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const endpoints = ['/api/card1', '/api/card2', '/api/card3'];
        const responses = await Promise.all(
          endpoints.map(endpoint =>
            fetch(endpoint).then(res => res.json())
          )
        );
        setImages(responses);
      } catch (err) {
        setError('Failed to load images');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const updateSpacing = () => {
      const width = window.innerWidth;
      const spacing = width < 600 ? 2.2 : width < 900 ? 3.2 : 4;
      setCardSpacing(spacing);
    };

    updateSpacing();
    window.addEventListener('resize', updateSpacing);
    return () => window.removeEventListener('resize', updateSpacing);
  }, []);

  
 

  return (
    <div className="home-page">
      <Header/>

      {loading && <div className="home-status loading">Loading...</div>}
      {error && <div className="home-status error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="canvas-wrapper">
            <Canvas
              camera={{ position: [0, 0, 8], fov: 60 }}
              style={{
                background: 'radial-gradient(ellipse at top, rgb(26, 26, 47) 0%, #000 80%)',
              }}
            >
              <ambientLight intensity={0.9} />
              <directionalLight position={[10, 10, 8]} intensity={1.2} />
              {images.map((group, i) => {
                const randomImage = group[Math.floor(Math.random() * group.length)];
                const pos: [number, number, number] = [(i - 1) * cardSpacing, 0, -1];
                return (
                  <HomeCard3D
                    key={i}
                    title={apiNames[i]}
                    imageUrl={randomImage?.url || ''}
                    position={pos}
                    rotation={rotations[i]}
                    onClick={() => navigate(`/gallery/${i + 1}`)}
                  />
                );
              })}
            </Canvas>
          </div>

          <div className="hover-tip">
            Please hover over a card to select your Oracle of the Universe...
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default HomePage;
