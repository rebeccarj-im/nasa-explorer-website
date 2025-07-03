import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import './Overlay.css';

interface OverlayProps {
  title: string;
  url: string;
  date?: string;
  library?: string;
  nasaId?: string;
  explanation?: string;
  onClose: () => void;
}

const Overlay: React.FC<OverlayProps> = ({
  title,
  url,
  date,
  library,
  nasaId,
  explanation,
  onClose
}) => {
  const normalizedLibrary = library?.toLowerCase();
  const chartRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [epicData, setEpicData] = useState<null | {
    earthToSun: number;
    earthToMoon: number;
    earthToEpic: number;
    sevAngle: number;
  }>(null);

  const [apodData, setApodData] = useState<null | {
    title: string;
    explanation: string;
    url: string;
    date: string;
  }>(null);

  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [assetType, setAssetType] = useState<'image' | 'video'>('image');
  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (normalizedLibrary === 'epic' && date && title) {
      fetch(`/api/epic-detail?date=${encodeURIComponent(date)}&title=${encodeURIComponent(title)}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setEpicData(data);
        })
        .catch(err => console.error('EPIC detail fetch failed:', err));
    }
  }, [normalizedLibrary, date, title]);

  useEffect(() => {
    if (normalizedLibrary === 'epic' && chartRef.current && epicData) {
      const chart = echarts.init(chartRef.current);
      chart.setOption({
        title: { text: 'EPIC: Earth-Space Distances', left: 'center' },
        tooltip: { trigger: 'item', formatter: '{b}: {c} km' },
        grid: { left: 120, right: 20, top: 50, bottom: 30 },
        yAxis: {
          type: 'category',
          data: ['Earth to Sun', 'Earth to Moon', 'Earth to EPIC'],
          axisLabel: { fontSize: 14 }
        },
        xAxis: {
          type: 'value',
          name: 'km',
          axisLabel: {
            formatter: (value: number) => value.toLocaleString()
          }
        },
        series: [{
          type: 'bar',
          data: [epicData.earthToSun, epicData.earthToMoon, epicData.earthToEpic],
          itemStyle: { color: '#5470c6' }
        }]
      });
    }
  }, [normalizedLibrary, epicData]);

  useEffect(() => {
    if (normalizedLibrary === 'apod' && date) {
      fetch(`/api/apod-detail?date=${encodeURIComponent(date)}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setApodData({
              title: data.title,
              explanation: data.explanation,
              url: data.url,
              date: data.date
            });
          }
        })
        .catch(err => console.error('APOD fetch failed', err));
    }
  }, [normalizedLibrary, date]);

  useEffect(() => {
    if (normalizedLibrary === 'image library' && nasaId) {
      fetch(`/api/image-detail?id=${encodeURIComponent(nasaId)}`)
        .then(res => res.json())
        .then(data => {
          if (data?.url) {
            setAssetUrl(data.url);
            setAssetType(data.type === 'video' ? 'video' : 'image');
          }
        })
        .catch(err => console.error('Image detail fetch failed:', err));
    }
  }, [normalizedLibrary, nasaId]);

  const displayUrl =
    normalizedLibrary === 'apod'
      ? apodData?.url || url
      : normalizedLibrary === 'image library'
        ? assetUrl || url
        : url;

  const isVideo = normalizedLibrary === 'image library' && assetType === 'video';

  const handleClose = () => {
    setIsClosing(true);
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const shouldShowContent =
    (normalizedLibrary === 'apod' && apodData) || normalizedLibrary !== 'apod';

  return (
    <div
      className={`overlay-backdrop ${normalizedLibrary === 'apod' ? 'apod-background' : ''} ${visible && !isClosing ? 'show' : 'hide'}`}
      style={{
        ...(normalizedLibrary === 'apod' && apodData?.url
          ? { backgroundImage: `url(${apodData.url})` }
          : {}),
        backgroundColor: 'rgba(0, 0, 0, 0.85)'
      }}
      onClick={handleClose}
    >
      {!shouldShowContent ? (
        <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>
          Loading APOD...
        </div>
      ) : (
        <div className="overlay-content" onClick={e => e.stopPropagation()}>
          <button className="overlay-close" onClick={handleClose}>×</button>

          {normalizedLibrary !== 'apod' && (
            isVideo ? (
              assetUrl ? (
                <div className="video-wrapper">
                  <video
                    ref={videoRef}
                    className="overlay-image"
                    src={assetUrl}
                    controls
                    onClick={(e) => e.stopPropagation()}
                  />
                  {!isVideoPlaying && (
                    <button
                      className="video-play-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        videoRef.current?.play().then(() => {
                          setIsVideoPlaying(true);
                        }).catch(err => {
                          console.error('Video play failed:', err);
                        });
                      }}
                    >
                      ▶
                    </button>
                  )}
                </div>
              ) : (
                <p style={{ color: 'white', textAlign: 'center' }}>Loading video...</p>
              )
            ) : (
              <img className="overlay-image" src={displayUrl} alt={title} />
            )
          )}

          <div className="overlay-text">
            {normalizedLibrary === 'image library' && (
              <>
                <p><strong>Title:</strong> {title}</p>
                {explanation && (
                  <p><strong>Explanation:</strong> {explanation}</p>
                )}
              </>
            )}

            {normalizedLibrary === 'epic' && (
              <>
                <p><strong>Image:</strong> {title}</p>
                <p><strong>Date:</strong> {date}</p>
                <p><em>EPIC imagery from the DSCOVR satellite.</em></p>
                {epicData ? (
                  <>
                    <div ref={chartRef} style={{ height: 300, marginTop: 20 }} />
                    <p style={{ marginTop: 10 }}>
                      <strong>SEV Angle:</strong> {epicData.sevAngle}&deg;
                    </p>
                  </>
                ) : (
                  <p>Loading EPIC image data...</p>
                )}
              </>
            )}

            {normalizedLibrary === 'apod' && apodData && (
              <div className="overlay-apod-text">
                <h3>{apodData.title}</h3>
                <p>{apodData.explanation}</p>
                <p><small>{apodData.date}</small></p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overlay;
