import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Maximize2, Radio, Compass, Layers, Sparkles } from 'lucide-react';
import { MunicipalClusterSummary } from '../../types';

interface SpatialIntelligenceMiniProps {
  clusters: MunicipalClusterSummary[];
  onExpandMap?: () => void;
  onSelectCluster?: (cluster: MunicipalClusterSummary) => void;
}

export const SpatialIntelligenceMini: React.FC<SpatialIntelligenceMiniProps> = ({
  clusters,
  onExpandMap,
  onSelectCluster,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCluster, setActiveCluster] = useState<MunicipalClusterSummary | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 200;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a111f);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 14, 16);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x93c5fd, 1.2);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // City Grid Floor
    const gridHelper = new THREE.GridHelper(24, 24, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Concentric Radar Rings
    const ringGeo = new THREE.RingGeometry(3, 3.08, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const radarRing = new THREE.Mesh(ringGeo, ringMat);
    radarRing.rotation.x = -Math.PI / 2;
    radarRing.position.y = 0.05;
    scene.add(radarRing);

    const radarRing2 = radarRing.clone();
    radarRing2.scale.set(2.2, 2.2, 2.2);
    scene.add(radarRing2);

    // Buildings Group (deterministic low-poly blocks)
    const buildingGroup = new THREE.Group();
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshLambertMaterial({
      color: 0x131f37,
      transparent: true,
      opacity: 0.85,
    });

    const buildingCoords = [
      { x: -5, z: -3, h: 2.2 },
      { x: -3, z: -4, h: 3.5 },
      { x: 3, z: -4, h: 2.8 },
      { x: 5, z: -2, h: 1.8 },
      { x: -4, z: 3, h: 2.5 },
      { x: 4, z: 3, h: 3.2 },
      { x: -2, z: 5, h: 1.5 },
      { x: 2, z: 4, h: 2.0 },
    ];

    buildingCoords.forEach((b) => {
      const mesh = new THREE.Mesh(boxGeo, buildingMat);
      mesh.scale.set(1.4, b.h, 1.4);
      mesh.position.set(b.x, b.h / 2, b.z);
      buildingGroup.add(mesh);
    });
    scene.add(buildingGroup);

    // Dynamic Cluster Hotspots
    const clusterGroup = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(0.35, 16, 16);

    const clusterPositions = [
      { x: -2.5, z: 1.5, color: 0xdc2626 }, // Drainage (Critical)
      { x: 3.2, z: -1.2, color: 0x2563eb }, // Streetlight (High)
      { x: -1.8, z: -3.0, color: 0xf59e0b }, // Road Damage
      { x: 2.0, z: 2.5, color: 0x10b981 }, // Noise
    ];

    clusterPositions.forEach((pos, idx) => {
      const clusterMat = new THREE.MeshBasicMaterial({ color: pos.color });
      const node = new THREE.Mesh(sphereGeo, clusterMat);
      node.position.set(pos.x, 0.4, pos.z);

      // Beacon ring
      const beaconRingGeo = new THREE.RingGeometry(0.6, 0.72, 32);
      const beaconRingMat = new THREE.MeshBasicMaterial({
        color: pos.color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const beacon = new THREE.Mesh(beaconRingGeo, beaconRingMat);
      beacon.rotation.x = -Math.PI / 2;
      beacon.position.set(pos.x, 0.08, pos.z);

      clusterGroup.add(node);
      clusterGroup.add(beacon);
    });
    scene.add(clusterGroup);

    // Subtle continuous rotation & radar pulse animation
    let time = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      time += 0.015;

      // Slow orbital drift
      if (cameraRef.current) {
        cameraRef.current.position.x = Math.sin(time * 0.15) * 14;
        cameraRef.current.position.z = Math.cos(time * 0.15) * 14;
        cameraRef.current.lookAt(0, 0, 0);
      }

      // Pulse radar
      const scale = 1 + Math.sin(time * 1.5) * 0.15;
      radarRing.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 200;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="bg-[#0A111F] rounded-2xl border border-slate-800 p-5 shadow-2xs space-y-3 relative overflow-hidden text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-300">
            Spatial Operations Radar
          </h4>
        </div>

        {onExpandMap && (
          <button
            onClick={onExpandMap}
            className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>FULL GIS</span>
            <Maximize2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-44 rounded-xl overflow-hidden relative cursor-grab">
        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-black/60 backdrop-blur-xs rounded-md text-[10px] font-mono text-cyan-200 border border-cyan-500/20">
          MESH: 4 CLUSTER BEACONS
        </div>
      </div>

      {/* Bottom Telemetry Mini-Strip */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
        <span className="flex items-center gap-1 text-slate-300">
          <Compass className="w-3 h-3 text-cyan-400" />
          Sector 14 Grid Sync
        </span>
        <span className="text-emerald-400 font-semibold">RADAR ACTIVE</span>
      </div>
    </div>
  );
};

export default SpatialIntelligenceMini;
