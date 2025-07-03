import React, { useEffect, useRef, useState } from 'react';
import Overlay from '../../components/Overlay/Overlay';
import './GalleryPage.css';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';

interface ImageData {
  title: string;
  url: string;
  explanation?: string;
  date?: string;
}
const API_BASE = import.meta.env.VITE_API_URL;

const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flippingIndex, setFlippingIndex] = useState<number | null>(null);
  const [pendingOverlay, setPendingOverlay] = useState<ImageData | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const ringRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const targetAngle = useRef(0);

  const navigate = useNavigate();
  const { id } = useParams();

  const libraryNames = ['Image Library', 'EPIC', 'APOD'];
  const libraryName = id ? libraryNames[parseInt(id) - 1] : 'Gallery';

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/card${id}`);
        const data = await res.json();
        setImages(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load images');
      }
    };
    fetchImages();
  }, [id]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let lastX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (lastX === 0) lastX = e.clientX;
      if (isOverlayOpen) return;
      const dx = e.clientX - lastX;
      const rotationPerPixel = 0.3;
      targetAngle.current += dx * rotationPerPixel;
      lastX = e.clientX;
    };

    container.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      if (!isOverlayOpen) {
        angleRef.current += (targetAngle.current - angleRef.current) * 0.1;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate(-50%, -50%) rotateY(${angleRef.current}deg)`;
        }
      }
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [images, isOverlayOpen]);

  const goLeft = () => {
    const segment = 360 / images.length;
    targetAngle.current -= segment;
  };

  const goRight = () => {
    const segment = 360 / images.length;
    targetAngle.current += segment;
  };

  const handleCardClick = (index: number, img: ImageData) => {
    setFlippingIndex(index);
    setPendingOverlay(img);

   
    setTimeout(() => {
      setIsOverlayOpen(true);
    }, 300);
  };

  const onAnimationEnd = (index: number) => {
    if (flippingIndex === index && pendingOverlay) {
      setFlippingIndex(null);

      
      setTimeout(() => {
        setSelectedImage(pendingOverlay);
        setPendingOverlay(null);
      }, 200);
    }
  };

  const handleOverlayClose = () => {
    setSelectedImage(null);
    setIsOverlayOpen(false);
  };

  
  const isApod = libraryName.toLowerCase() === 'apod';
  const isOverlayReady = isApod
    ? selectedImage && selectedImage.url 
    : selectedImage;

  if (error) return <div className="error-message">{error}</div>;
  if (!images.length) return <div className="loading-message">Loading space images...</div>;

  return (
    <div className="gallery-page" ref={containerRef}>
      <Header />
      <button className="back-button" onClick={() => navigate(-1)}>&larr;</button>
      <h1 className="gallery-title">{libraryName}</h1>

      <div className="ring-scene">
        <div className="ring" ref={ringRef}>
          {images.map((img, i) => {
            const segment = 360 / images.length;
            const angle = segment * i;
            const radius = 700;

            const relativeAngle = ((angle - (angleRef.current % 360)) + 360) % 360;
            const distance = relativeAngle > 180 ? 360 - relativeAngle : relativeAngle;
            const brightness = distance < 20 ? 1 : 0.7;

            return (
              <div
                key={i}
                className={`carousel-card ring-card ${flippingIndex === i ? 'flip-double' : ''}`}
                style={{
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                  filter: `brightness(${brightness})`,
                }}
                onClick={() => handleCardClick(i, img)}
                onAnimationEnd={() => onAnimationEnd(i)}
              >
                <img src={img.url} alt={img.title} />
                <div className="card-caption">{img.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="arrow-buttons">
        <button aria-label="Previous" onClick={goLeft}>&larr;</button>
        <button aria-label="Next" onClick={goRight}>&rarr;</button>
      </div>

      
      {isOverlayOpen && isOverlayReady && (
        <Overlay
          title={selectedImage!.title}
          url={selectedImage!.url}
          explanation={selectedImage!.explanation}
          library={libraryName}
          date={selectedImage!.date}
          onClose={handleOverlayClose}
        />
      )}
    </div>
  );
};

export default GalleryPage;
