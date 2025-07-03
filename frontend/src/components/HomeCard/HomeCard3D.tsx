import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { Html, RoundedBox } from '@react-three/drei';
import './HomeCard3D.css';
import { a, useSpring } from '@react-spring/three';

interface HomeCard3DProps {
  title: string;
  imageUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  onClick: () => void;
}

const HomeCard3D: React.FC<HomeCard3DProps> = ({
  title,
  imageUrl,
  position,
  rotation,
  onClick,
}) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [hovered, setHovered] = useState(false);
  const [planeSize, setPlaneSize] = useState<[number, number]>([2.4, 1.6]);

  useEffect(() => {
    if (!imageUrl) return;
    const apiBase = import.meta.env.VITE_API_URL;
    const proxyUrl = `${apiBase}/proxy-image?url=${encodeURIComponent(imageUrl)}`;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const { width, height } = img;
      const ratio = width / height;
      const planeW = 2.4;
      const planeH = 2.4 / ratio;
      setPlaneSize([planeW, planeH]);
    };
    img.src = proxyUrl;

    const loader = new THREE.ImageLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      proxyUrl,
      (image) => {
        const tex = new THREE.Texture(image);
        tex.needsUpdate = true;
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.error('Texture load failed:', err);
      }
    );
  }, [imageUrl]);

  const { scale, rotX, rotY, rotZ } = useSpring({
    scale: hovered ? 1.09 : 1,
    rotX: hovered ? 0 : rotation[0],
    rotY: hovered ? 0 : rotation[1],
    rotZ: hovered ? 0 : rotation[2],
    config: { mass: 1.15, tension: 120, friction: 18 },
  });

  if (!texture) return null;

  return (
    <a.group
      position={position}
      scale={scale}
      rotation-x={rotX}
      rotation-y={rotY}
      rotation-z={rotZ}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      <RoundedBox
        args={[planeSize[0], planeSize[1], 0.002]}
        radius={0.02}
        smoothness={10}
      >
        <meshStandardMaterial map={texture} />

        {hovered && (
          <Html center distanceFactor={5} position={[0, -planeSize[1] / 2 - 0.22, 0]}>
            <div className="card-title">{title}</div>
          </Html>
        )}
      </RoundedBox>
    </a.group>
  );
};

export default HomeCard3D;
