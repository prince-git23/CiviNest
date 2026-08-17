import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ContextMarkerData } from './ContextMarker';

interface CivicContextSceneProps {
  markers: ContextMarkerData[];
  selectedMarkerId?: string | null;
  onSelectMarker?: (marker: ContextMarkerData) => void;
  locality?: string;
  ward?: string;
}

export const CivicContextScene: React.FC<CivicContextSceneProps> = ({
  markers,
  selectedMarkerId = null,
  onSelectMarker,
  locality = 'Dharampeth',
  ward = 'Ward #14',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredMarker, setHoveredMarker] = useState<ContextMarkerData | null>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const markersMeshMap = useRef<Map<string, THREE.Group>>(new Map());
  const residentBeaconRef = useRef<THREE.Group | null>(null);
  const connectionLinesRef = useRef<THREE.Line[]>([]);

  // Focus specific 3D marker with smooth camera
  const focusOnMarker = useCallback((marker: ContextMarkerData) => {
    if (!cameraRef.current) return;
    const [mx, my, mz] = marker.position;

    gsap.to(cameraRef.current.position, {
      x: mx * 0.8 + 4,
      y: my + 7,
      z: mz * 0.8 + 8,
      duration: 1.1,
      ease: 'power2.inOut',
    });
  }, []);

  // Update camera on selected marker change
  useEffect(() => {
    if (selectedMarkerId) {
      const match = markers.find((m) => m.id === selectedMarkerId);
      if (match) {
        focusOnMarker(match);
      }
    }
  }, [selectedMarkerId, markers, focusOnMarker]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 500;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1d20);
    scene.fog = new THREE.FogExp2(0x1a1d20, 0.045);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 11, 13);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xdbe4ee, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(12, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const bluePointLight = new THREE.PointLight(0x38bdf8, 3, 20);
    bluePointLight.position.set(0, 3, 0);
    scene.add(bluePointLight);

    // 5. Main Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    objectsGroupRef.current = rootGroup;

    // 6. Ground Base Grid & Coordinates
    const gridHelper = new THREE.GridHelper(24, 24, 0x334155, 0x22262b);
    gridHelper.position.y = -0.01;
    rootGroup.add(gridHelper);

    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x14171a,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    rootGroup.add(ground);

    // 7. Stylized Low-Poly Urban Buildings
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x262b30,
      roughness: 0.7,
      metalness: 0.2,
    });

    const buildingAccMat = new THREE.MeshStandardMaterial({
      color: 0x333b44,
      roughness: 0.6,
      metalness: 0.3,
    });

    const buildingPositions = [
      { x: -4.5, z: -3.5, w: 2.2, h: 2.8, d: 2.0 },
      { x: -4.8, z: 1.5, w: 2.0, h: 3.5, d: 2.2 },
      { x: -2.0, z: -4.2, w: 1.8, h: 2.2, d: 1.8 },
      { x: 3.8, z: -3.8, w: 2.4, h: 3.0, d: 2.2 },
      { x: 4.2, z: 2.0, w: 2.2, h: 4.0, d: 2.5 },
      { x: 1.5, z: -4.5, w: 2.0, h: 1.8, d: 1.6 },
      { x: -1.5, z: 4.0, w: 2.2, h: 2.5, d: 2.0 },
      { x: 2.5, z: 4.2, w: 1.8, h: 2.0, d: 1.8 },
    ];

    buildingPositions.forEach((b) => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mesh = new THREE.Mesh(geo, Math.random() > 0.5 ? buildingMat : buildingAccMat);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      rootGroup.add(mesh);

      // Building rooftop antenna or edge trim
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.4 });
      const wireframe = new THREE.LineSegments(edgeGeo, lineMat);
      mesh.add(wireframe);
    });

    // 8. Road Network Crossway
    const roadMat = new THREE.MeshBasicMaterial({ color: 0x1f2429 });
    const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(24, 1.8), roadMat);
    hRoad.rotation.x = -Math.PI / 2;
    hRoad.position.y = 0.01;
    rootGroup.add(hRoad);

    const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 24), roadMat);
    vRoad.rotation.x = -Math.PI / 2;
    vRoad.position.y = 0.01;
    rootGroup.add(vRoad);

    // 9. Central Resident Location Beacon (Red/Blue pulse)
    const residentGroup = new THREE.Group();
    residentGroup.position.set(0, 0, 0);
    rootGroup.add(residentGroup);
    residentBeaconRef.current = residentGroup;

    // Pin core
    const pinGeo = new THREE.SphereGeometry(0.28, 16, 16);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.6,
    });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.position.y = 0.6;
    residentGroup.add(pinMesh);

    // Pin stem
    const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
    const stemMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.position.y = 0.3;
    residentGroup.add(stemMesh);

    // Concentric pulsing rings
    const ringGeo = new THREE.RingGeometry(0.3, 0.45, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.03;
    residentGroup.add(ringMesh);

    // 10. Nearby Context Infrastructure Markers
    markersMeshMap.current.clear();

    markers.forEach((marker) => {
      const mGroup = new THREE.Group();
      mGroup.position.set(marker.position[0], marker.position[1], marker.position[2]);
      mGroup.userData = { marker };

      const isLight = marker.icon === 'light';
      const isSchool = marker.icon === 'school';
      const markerColor = isLight ? 0xf59e0b : isSchool ? 0x3b82f6 : 0x06b6d4;

      // Marker sphere head
      const nodeGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: markerColor,
        emissive: markerColor,
        emissiveIntensity: 0.5,
        roughness: 0.3,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.y = 0.7;
      mGroup.add(nodeMesh);

      // Marker pillar
      const colGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 8);
      const colMat = new THREE.MeshBasicMaterial({ color: markerColor, transparent: true, opacity: 0.7 });
      const colMesh = new THREE.Mesh(colGeo, colMat);
      colMesh.position.y = 0.35;
      mGroup.add(colMesh);

      // Ground base halo
      const baseGeo = new THREE.RingGeometry(0.2, 0.32, 24);
      const baseMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.rotation.x = -Math.PI / 2;
      baseMesh.position.y = 0.03;
      mGroup.add(baseMesh);

      rootGroup.add(mGroup);
      markersMeshMap.current.set(marker.id, mGroup);

      // Curved Bezier Signal Connection Line to Resident
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 0.6, 0),
        new THREE.Vector3(marker.position[0] * 0.5, 1.8, marker.position[2] * 0.5),
        new THREE.Vector3(marker.position[0], 0.7, marker.position[2])
      );

      const points = curve.getPoints(30);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: markerColor,
        dashSize: 0.3,
        gapSize: 0.15,
        transparent: true,
        opacity: 0.6,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      rootGroup.add(line);
      connectionLinesRef.current.push(line);
    });

    // 11. Ambient Floating Civic Data Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 16;
      particlePositions[i + 1] = Math.random() * 5 + 0.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 16;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.08,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // 12. Mouse Raycaster for Interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Subtle parallax rotation
      gsap.to(rootGroup.rotation, {
        y: mouse.x * 0.06,
        x: mouse.y * 0.04,
        duration: 0.8,
        ease: 'power1.out',
      });
    };

    const handleClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes: THREE.Object3D[] = [];
      markersMeshMap.current.forEach((g) => {
        g.children.forEach((c) => interactiveMeshes.push(c));
      });

      const intersects = raycaster.intersectObjects(interactiveMeshes, false);
      if (intersects.length > 0) {
        let parent = intersects[0].object.parent;
        if (parent && parent.userData && parent.userData.marker) {
          const markerData = parent.userData.marker as ContextMarkerData;
          if (onSelectMarker) onSelectMarker(markerData);
          focusOnMarker(markerData);
        }
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // 13. Responsive Resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const nw = entry.contentRect.width;
        const nh = entry.contentRect.height;
        if (nw > 0 && nh > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = nw / nh;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(nw, nh);
        }
      }
    });
    resizeObserver.observe(container);

    // 14. Animation Loop
    let clock = new THREE.Clock();
    let ringScale = 1;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Pulsing resident ring
      if (ringMesh) {
        ringScale = 1 + Math.sin(elapsedTime * 3) * 0.25;
        ringMesh.scale.set(ringScale, ringScale, 1);
      }

      // Floating hover bob for markers
      markersMeshMap.current.forEach((mGroup, id) => {
        mGroup.position.y = Math.sin(elapsedTime * 2 + (mGroup.position.x * 0.5)) * 0.06;
      });

      // Slowly float particles
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      if (posAttr) {
        const arr = posAttr.array as Float32Array;
        for (let i = 1; i < arr.length; i += 3) {
          arr[i] += 0.003;
          if (arr[i] > 6) arr[i] = 0.5;
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Initial entrance animation
    gsap.fromTo(
      camera.position,
      { y: 18, z: 20 },
      { y: 11, z: 13, duration: 1.5, ease: 'power3.out' }
    );

    // Cleanup
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);

      // Dispose Geometries & Materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      container.replaceChildren();
    };
  }, [markers, focusOnMarker, onSelectMarker]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden bg-[#1a1d20]">
      {/* Three.js canvas container */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Top Floating Spatial Context Pill */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#14171a]/85 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[11px] font-mono text-slate-200">
          GIS MESH · {ward} · {locality}
        </span>
      </div>

      {/* Camera Reset Trigger */}
      <button
        type="button"
        onClick={() => {
          if (cameraRef.current) {
            gsap.to(cameraRef.current.position, {
              x: 0,
              y: 11,
              z: 13,
              duration: 1.0,
              ease: 'power2.inOut',
            });
          }
        }}
        className="absolute top-4 right-4 z-10 bg-[#14171a]/80 hover:bg-[#14171a] border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg text-xs font-mono transition-colors shadow cursor-pointer"
      >
        Reset Cam
      </button>
    </div>
  );
};
