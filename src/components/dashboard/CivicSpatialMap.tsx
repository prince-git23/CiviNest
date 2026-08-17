import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import {
  Layers,
  Filter,
  Maximize2,
  Minimize2,
  RefreshCw,
  Info,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Shield,
  Eye,
} from 'lucide-react';
import { SpatialMapNode } from '../../types';

interface CivicSpatialMapProps {
  nodes: SpatialMapNode[];
  onSelectNode: (node: SpatialMapNode) => void;
  selectedNodeId?: string | null;
  wardName?: string;
  localityName?: string;
}

export const CivicSpatialMap: React.FC<CivicSpatialMapProps> = ({
  nodes,
  onSelectNode,
  selectedNodeId = null,
  wardName = 'Dharampeth',
  localityName = 'Green Valley Residency',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<SpatialMapNode | null>(null);
  const [activeLayer, setActiveLayer] = useState<{
    issues: boolean;
    community: boolean;
    infrastructure: boolean;
    reports: boolean;
  }>({
    issues: true,
    community: true,
    infrastructure: true,
    reports: true,
  });
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'attention' | 'info'>('all');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // References for Three.js internals
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const nodesGroupRef = useRef<THREE.Group | null>(null);
  const nodeMeshMapRef = useRef<Map<string, { mesh: THREE.Mesh; ring: THREE.Mesh; line: THREE.Line; data: SpatialMapNode }>>(new Map());
  const focusNodeRef = useRef<((node: SpatialMapNode) => void) | null>(null);

  // Filtered nodes
  const filteredNodes = nodes.filter((n) => {
    if (severityFilter === 'all') return true;
    return n.severity === severityFilter;
  });

  // Focus node in 3D scene handler
  const handleFocusNode = useCallback((node: SpatialMapNode) => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    
    // Smooth camera pan to target position
    const targetX = node.position[0] * 0.8 + 6;
    const targetY = 9;
    const targetZ = node.position[2] * 0.8 + 10;

    gsap.to(camera.position, {
      x: targetX,
      y: targetY,
      z: targetZ,
      duration: 1.2,
      ease: 'power2.inOut',
    });

    onSelectNode(node);
  }, [onSelectNode]);

  // Expose focus handler to external ref
  focusNodeRef.current = handleFocusNode;

  // Reset Camera View
  const handleResetCamera = () => {
    if (!cameraRef.current) return;
    gsap.to(cameraRef.current.position, {
      x: 10,
      y: 13,
      z: 15,
      duration: 1.2,
      ease: 'power2.inOut',
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Atmosphere Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0xF5F7FA, 0.025);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(10, 13, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xE2E8F0, 1.4);
    dirLight.position.set(12, 22, 14);
    scene.add(dirLight);

    const blueAccentLight = new THREE.PointLight(0x3B82F6, 2.0, 25);
    blueAccentLight.position.set(0, 3, 0);
    scene.add(blueAccentLight);

    // 4. Urban Geometry Root Group
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // 4a. Coordinate Ground Grid
    const gridHelper = new THREE.GridHelper(26, 26, 0xCBD5E1, 0xE2E8F0);
    gridHelper.position.y = -0.02;
    cityGroup.add(gridHelper);

    // 4b. Base Ground Plane with road layout textures
    const groundGeo = new THREE.PlaneGeometry(26, 26);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0xF8FAFC,
      transparent: true,
      opacity: 0.9,
    });
    const groundPlane = new THREE.Mesh(groundGeo, groundMat);
    groundPlane.rotation.x = -Math.PI / 2;
    groundPlane.position.y = -0.05;
    cityGroup.add(groundPlane);

    // 4c. Procedural Urban City Blocks
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0xEEF2F6,
      roughness: 0.4,
      metalness: 0.05,
      transparent: true,
      opacity: 0.85,
    });
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x94A3B8,
      transparent: true,
      opacity: 0.35,
    });

    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [buildingMat, wireMat, groundMat];

    const buildingCount = 26;
    for (let i = 0; i < buildingCount; i++) {
      const gx = ((i % 6) - 2.5) * 2.8 + (Math.sin(i * 2.1) * 0.3);
      const gz = (Math.floor(i / 6) - 2) * 2.8 + (Math.cos(i * 1.7) * 0.3);

      // Keep central civic plaza open
      if (Math.abs(gx) < 1.5 && Math.abs(gz) < 1.5) continue;

      const w = 1.1 + Math.sin(i * 3.4) * 0.3;
      const d = 1.1 + Math.cos(i * 2.9) * 0.3;
      const h = 0.6 + Math.abs(Math.sin(i * 4.3)) * 2.4;

      const boxGeo = new THREE.BoxGeometry(w, h, d);
      geometriesToDispose.push(boxGeo);
      const boxMesh = new THREE.Mesh(boxGeo, buildingMat);
      boxMesh.position.set(gx, h / 2, gz);
      cityGroup.add(boxMesh);

      const edgesGeo = new THREE.EdgesGeometry(boxGeo);
      geometriesToDispose.push(edgesGeo);
      const edges = new THREE.LineSegments(edgesGeo, wireMat);
      edges.position.copy(boxMesh.position);
      cityGroup.add(edges);
    }

    // 4d. Resident Center Marker ("You are here" / Green Valley Residency Hub)
    const hubCenterGroup = new THREE.Group();
    hubCenterGroup.position.set(0, 0, 0);
    cityGroup.add(hubCenterGroup);

    const hubPillarGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16);
    geometriesToDispose.push(hubPillarGeo);
    const hubPillarMat = new THREE.MeshStandardMaterial({
      color: 0x0F1E36,
      metalness: 0.2,
      roughness: 0.3,
    });
    materialsToDispose.push(hubPillarMat);
    const hubPillar = new THREE.Mesh(hubPillarGeo, hubPillarMat);
    hubPillar.position.y = 0.075;
    hubCenterGroup.add(hubPillar);

    const beaconGeo = new THREE.SphereGeometry(0.2, 16, 16);
    geometriesToDispose.push(beaconGeo);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x2563EB });
    materialsToDispose.push(beaconMat);
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.y = 0.7;
    hubCenterGroup.add(beaconMesh);

    // Glowing Pulse Ring around Resident Hub
    const hubRingGeo = new THREE.RingGeometry(0.6, 0.75, 32);
    geometriesToDispose.push(hubRingGeo);
    const hubRingMat = new THREE.MeshBasicMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    materialsToDispose.push(hubRingMat);
    const hubRing = new THREE.Mesh(hubRingGeo, hubRingMat);
    hubRing.rotation.x = -Math.PI / 2;
    hubRing.position.y = 0.02;
    hubCenterGroup.add(hubRing);

    // 5. Interactive Issue Nodes Group
    const nodesGroup = new THREE.Group();
    cityGroup.add(nodesGroup);
    nodesGroupRef.current = nodesGroup;

    const nodeMeshMap = new Map<string, { mesh: THREE.Mesh; ring: THREE.Mesh; line: THREE.Line; data: SpatialMapNode }>();

    nodes.forEach((item) => {
      const color =
        item.severity === 'critical'
          ? 0xEF4444 // Red
          : item.severity === 'attention'
          ? 0x3B82F6 // Blue
          : item.severity === 'info'
          ? 0xF59E0B // Amber
          : 0x10B981; // Green

      // Node Sphere
      const sphereGeo = new THREE.SphereGeometry(0.24, 16, 16);
      geometriesToDispose.push(sphereGeo);
      const sphereMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.4,
        roughness: 0.2,
      });
      materialsToDispose.push(sphereMat);
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(item.position[0], item.position[1] + 0.35, item.position[2]);
      sphereMesh.userData = { nodeId: item.id, data: item };
      nodesGroup.add(sphereMesh);

      // Node Ground Ring
      const ringGeo = new THREE.RingGeometry(0.35, 0.45, 24);
      geometriesToDispose.push(ringGeo);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      materialsToDispose.push(ringMat);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(item.position[0], 0.02, item.position[2]);
      nodesGroup.add(ringMesh);

      // Signal Connection Line to Resident Hub
      const linePoints = [
        new THREE.Vector3(0, 0.7, 0),
        new THREE.Vector3(item.position[0], item.position[1] + 0.35, item.position[2]),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      geometriesToDispose.push(lineGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.25,
      });
      materialsToDispose.push(lineMat);
      const line = new THREE.Line(lineGeo, lineMat);
      nodesGroup.add(line);

      nodeMeshMap.set(item.id, { mesh: sphereMesh, ring: ringMesh, line, data: item });
    });

    nodeMeshMapRef.current = nodeMeshMap;

    // 6. Raycasting for Node Hover and Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Subtle parallax camera shift
      if (!prefersReducedMotion && cameraRef.current) {
        gsap.to(cityGroup.rotation, {
          y: mouse.x * 0.08,
          x: -mouse.y * 0.04,
          duration: 0.8,
          ease: 'power1.out',
        });
      }

      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes = Array.from(nodeMeshMap.values()).map((v) => v.mesh);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const nodeData = hit.userData.data as SpatialMapNode;
        setHoveredNode(nodeData);
        container.style.cursor = 'pointer';

        // Scale up hovered node
        gsap.to(hit.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.2 });
      } else {
        setHoveredNode(null);
        container.style.cursor = 'default';
        interactiveMeshes.forEach((mesh) => {
          gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
        });
      }
    };

    const handlePointerClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes = Array.from(nodeMeshMap.values()).map((v) => v.mesh);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const nodeData = hit.userData.data as SpatialMapNode;
        handleFocusNode(nodeData);
      }
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handlePointerClick);

    // 7. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 8. Animation Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle Hub pulse ring expansion
      if (hubRing) {
        const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.18;
        hubRing.scale.set(pulse, pulse, 1);
      }

      // Idle node pulse
      nodeMeshMap.forEach(({ mesh, ring }) => {
        const p = 1 + Math.sin(elapsedTime * 3 + mesh.position.x) * 0.12;
        ring.scale.set(p, p, 1);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handlePointerClick);

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [nodes, handleFocusNode]);

  return (
    <div
      id="spatial-intelligence-map-card"
      className={`relative w-full bg-[#F5F7FA] rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : 'h-[440px] sm:h-[500px] mb-8'
      }`}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full relative" />

      {/* Top Map Layer & Filter Control Buttons */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Layers Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLayerMenu(!showLayerMenu);
              setShowFilterMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/90 hover:bg-white backdrop-blur-md text-[#1F2937] text-xs font-semibold rounded-lg border border-[#E5E7EB] shadow-xs hover:shadow transition-all cursor-pointer"
            title="Toggle Map Layers"
          >
            <Layers className="w-3.5 h-3.5 text-[#6B7280]" />
            <span className="hidden sm:inline">Layers</span>
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-2.5 z-30 animate-in fade-in duration-100 text-left">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9CA3AF] px-2 block mb-1">
                Data Layers
              </span>
              {(['issues', 'community', 'infrastructure', 'reports'] as const).map((layer) => (
                <label
                  key={layer}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#F9FAFB] text-xs text-[#374151] cursor-pointer capitalize"
                >
                  <span>{layer}</span>
                  <input
                    type="checkbox"
                    checked={activeLayer[layer]}
                    onChange={(e) => setActiveLayer({ ...activeLayer, [layer]: e.target.checked })}
                    className="rounded text-[#2563EB] focus:ring-0"
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowFilterMenu(!showFilterMenu);
              setShowLayerMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/90 hover:bg-white backdrop-blur-md text-[#1F2937] text-xs font-semibold rounded-lg border border-[#E5E7EB] shadow-xs hover:shadow transition-all cursor-pointer"
            title="Filter by Severity"
          >
            <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {showFilterMenu && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-[#E5E7EB] p-2 z-30 animate-in fade-in duration-100 text-left">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9CA3AF] px-2 block mb-1">
                Severity Level
              </span>
              {[
                { id: 'all', label: 'All Severities' },
                { id: 'critical', label: 'Critical / High' },
                { id: 'attention', label: 'Attention / Work' },
                { id: 'info', label: 'Investigating' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSeverityFilter(opt.id as any);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                    severityFilter === opt.id
                      ? 'bg-blue-50 text-[#2563EB] font-semibold'
                      : 'text-[#4B5563] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset Camera View */}
        <button
          onClick={handleResetCamera}
          className="p-2 bg-white/90 hover:bg-white backdrop-blur-md text-[#6B7280] hover:text-[#111827] rounded-lg border border-[#E5E7EB] shadow-xs transition-colors cursor-pointer"
          title="Reset 3D Map View"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-white/90 hover:bg-white backdrop-blur-md text-[#6B7280] hover:text-[#111827] rounded-lg border border-[#E5E7EB] shadow-xs transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Floating Bottom-Left: Local Civic Intelligence Panel */}
      <div className="absolute bottom-4 left-4 z-20 w-72 sm:w-84 bg-white/95 backdrop-blur-md rounded-xl border border-[#E5E7EB] p-3.5 shadow-lg text-left">
        <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-[#F3F4F6]">
          <div className="w-5 h-5 rounded-md bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <MapPin className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#374151]">
            Local Civic Intelligence
          </span>
        </div>

        <div className="space-y-2">
          {nodes.slice(0, 3).map((item) => {
            const dotColor =
              item.severity === 'critical'
                ? 'bg-[#EF4444]'
                : item.severity === 'attention'
                ? 'bg-[#3B82F6]'
                : 'bg-[#F59E0B]';

            const isSelected = selectedNodeId === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleFocusNode(item)}
                className={`w-full text-left p-1.5 rounded-lg transition-all flex items-start gap-2.5 group cursor-pointer ${
                  isSelected ? 'bg-blue-50/80 ring-1 ring-[#3B82F6]' : 'hover:bg-[#F9FAFB]'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[#111827] group-hover:text-[#2563EB] truncate">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#6B7280] truncate">
                    {item.sector} · {item.distance} · {item.assignedTo}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredNode && (
        <div className="absolute top-4 left-4 z-30 bg-white/95 backdrop-blur-md rounded-xl border border-[#E5E7EB] p-3 shadow-xl max-w-xs text-left animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${
                hoveredNode.severity === 'critical' ? 'bg-[#EF4444]' : 'bg-[#3B82F6]'
              }`}
            />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
              {hoveredNode.category}
            </span>
          </div>
          <h4 className="text-xs font-bold text-[#111827]">{hoveredNode.title}</h4>
          <p className="text-[11px] text-[#4B5563] mt-1 line-clamp-2">{hoveredNode.description}</p>
          <div className="mt-2 pt-1.5 border-t border-[#F3F4F6] text-[10px] font-mono text-[#2563EB] font-semibold flex items-center justify-between">
            <span>{hoveredNode.distance}</span>
            <span>Click to inspect</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CivicSpatialMap;
