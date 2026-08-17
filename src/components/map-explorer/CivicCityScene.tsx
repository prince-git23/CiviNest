import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import {
  MapClusterItem,
  InfrastructureNode,
  MapFilterState,
  generateDeterministicCityBuildings,
  CityBuildingData,
} from '../../services/mapExplorerService';
import { MapPin, ShieldAlert, Sparkles, School, Hospital, Bus, Zap } from 'lucide-react';

interface CivicCitySceneProps {
  clusters: MapClusterItem[];
  infrastructure: InfrastructureNode[];
  filters: MapFilterState;
  selectedClusterId: string | null;
  onSelectCluster: (cluster: MapClusterItem) => void;
  userWardName?: string;
  userLocalityName?: string;
  zoomTrigger?: number;
  zoomOutTrigger?: number;
  locateTrigger?: number;
  resetTrigger?: number;
}

export const CivicCityScene: React.FC<CivicCitySceneProps> = ({
  clusters,
  infrastructure,
  filters,
  selectedClusterId,
  onSelectCluster,
  userWardName = 'Dharampeth Ward 14',
  userLocalityName = 'Green Valley Residency',
  zoomTrigger = 0,
  zoomOutTrigger = 0,
  locateTrigger = 0,
  resetTrigger = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCluster, setHoveredCluster] = useState<MapClusterItem | null>(null);
  const [hoveredInfra, setHoveredInfra] = useState<InfrastructureNode | null>(null);

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const clusterGroupRef = useRef<THREE.Group | null>(null);
  const infraGroupRef = useRef<THREE.Group | null>(null);
  const impactDiscRef = useRef<THREE.Mesh | null>(null);

  // Maps for raycast targets
  const clusterMeshMapRef = useRef<Map<string, { mesh: THREE.Mesh; ring: THREE.Mesh; beacon: THREE.Mesh; item: MapClusterItem }>>(new Map());
  const infraMeshMapRef = useRef<Map<string, { mesh: THREE.Mesh; item: InfrastructureNode }>>(new Map());

  // Focus Camera Handler
  const focusOnPosition = useCallback((pos: [number, number, number], zoomDistance = 8) => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    const targetX = pos[0] * 0.7 + 6;
    const targetY = 8;
    const targetZ = pos[2] * 0.7 + 9;

    gsap.to(camera.position, {
      x: targetX,
      y: targetY,
      z: targetZ,
      duration: 1.2,
      ease: 'power2.inOut',
    });
  }, []);

  // Zoom In / Out Handlers
  useEffect(() => {
    if (!cameraRef.current || zoomTrigger === 0) return;
    const cam = cameraRef.current;
    gsap.to(cam.position, {
      x: cam.position.x * 0.8,
      y: Math.max(cam.position.y * 0.8, 5),
      z: cam.position.z * 0.8,
      duration: 0.6,
      ease: 'power2.out',
    });
  }, [zoomTrigger]);

  useEffect(() => {
    if (!cameraRef.current || zoomOutTrigger === 0) return;
    const cam = cameraRef.current;
    gsap.to(cam.position, {
      x: cam.position.x * 1.25,
      y: Math.min(cam.position.y * 1.25, 25),
      z: cam.position.z * 1.25,
      duration: 0.6,
      ease: 'power2.out',
    });
  }, [zoomOutTrigger]);

  // Locate Resident Hub
  useEffect(() => {
    if (locateTrigger === 0) return;
    focusOnPosition([0, 0, 0]);
  }, [locateTrigger, focusOnPosition]);

  // Reset Camera View
  useEffect(() => {
    if (resetTrigger === 0 || !cameraRef.current) return;
    gsap.to(cameraRef.current.position, {
      x: 12,
      y: 15,
      z: 17,
      duration: 1.2,
      ease: 'power2.inOut',
    });
  }, [resetTrigger]);

  // Focus selected cluster when selectedClusterId changes externally
  useEffect(() => {
    if (!selectedClusterId) {
      if (impactDiscRef.current) {
        impactDiscRef.current.visible = false;
      }
      return;
    }
    const target = clusters.find((c) => c.id === selectedClusterId);
    if (target) {
      focusOnPosition(target.mapPosition);

      // Position and scale impact radius zone disc
      if (impactDiscRef.current) {
        impactDiscRef.current.position.set(target.mapPosition[0], 0.03, target.mapPosition[2]);
        const scale = (target.spatialHotspot.radiusMeters / 300) * 1.5;
        impactDiscRef.current.scale.set(scale, scale, 1);
        impactDiscRef.current.visible = true;
      }
    }
  }, [selectedClusterId, clusters, focusOnPosition]);

  // Main Three.js Scene Lifecycle
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Clean Atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0xF4F6F9, 0.022);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 150);
    camera.position.set(12, 15, 17);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. Renderer with High Pixel Ratio & Tonemapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.1);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xF1F5F9, 1.6);
    sunLight.position.set(15, 30, 20);
    scene.add(sunLight);

    const blueSubLight = new THREE.PointLight(0x3B82F6, 1.8, 30);
    blueSubLight.position.set(0, 4, 0);
    scene.add(blueSubLight);

    // 4. Urban Geometry Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    // 4a. Coordinate Grid & Ground Plane
    const gridHelper = new THREE.GridHelper(36, 36, 0xCBD5E1, 0xE2E8F0);
    gridHelper.position.y = -0.01;
    rootGroup.add(gridHelper);

    const groundGeo = new THREE.PlaneGeometry(36, 36);
    geometriesToDispose.push(groundGeo);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0xF8FAFC,
      transparent: true,
      opacity: 0.95,
    });
    materialsToDispose.push(groundMat);
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.04;
    rootGroup.add(groundMesh);

    // 4b. Deterministic Procedural City Buildings
    const cityBuildings = generateDeterministicCityBuildings();
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0xEEF2F6,
      roughness: 0.35,
      metalness: 0.05,
      transparent: true,
      opacity: 0.9,
    });
    materialsToDispose.push(buildingMat);

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x94A3B8,
      transparent: true,
      opacity: 0.35,
    });
    materialsToDispose.push(edgeMat);

    cityBuildings.forEach((bldg) => {
      const boxGeo = new THREE.BoxGeometry(bldg.width, bldg.height, bldg.depth);
      geometriesToDispose.push(boxGeo);

      const bldgMesh = new THREE.Mesh(boxGeo, buildingMat);
      bldgMesh.position.set(bldg.x, bldg.height / 2, bldg.z);
      rootGroup.add(bldgMesh);

      const edgesGeo = new THREE.EdgesGeometry(boxGeo);
      geometriesToDispose.push(edgesGeo);
      const edgeLines = new THREE.LineSegments(edgesGeo, edgeMat);
      edgeLines.position.copy(bldgMesh.position);
      rootGroup.add(edgeLines);
    });

    // 4c. Resident Civic Hub ("You are here" / Central Residency Base)
    const hubGroup = new THREE.Group();
    hubGroup.position.set(0, 0, 0);
    rootGroup.add(hubGroup);

    const hubPillarGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 24);
    geometriesToDispose.push(hubPillarGeo);
    const hubPillarMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      metalness: 0.3,
      roughness: 0.2,
    });
    materialsToDispose.push(hubPillarMat);
    const hubPillar = new THREE.Mesh(hubPillarGeo, hubPillarMat);
    hubPillar.position.y = 0.1;
    hubGroup.add(hubPillar);

    const hubBeaconGeo = new THREE.SphereGeometry(0.26, 20, 20);
    geometriesToDispose.push(hubBeaconGeo);
    const hubBeaconMat = new THREE.MeshBasicMaterial({ color: 0x2563EB });
    materialsToDispose.push(hubBeaconMat);
    const hubBeacon = new THREE.Mesh(hubBeaconGeo, hubBeaconMat);
    hubBeacon.position.y = 0.8;
    hubGroup.add(hubBeacon);

    // Glowing Pulse Ring for Hub
    const hubRingGeo = new THREE.RingGeometry(0.8, 0.95, 32);
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
    hubRing.position.y = 0.03;
    hubGroup.add(hubRing);

    // 4d. Dynamic Selected Impact Radius Disc
    const impactGeo = new THREE.RingGeometry(1.8, 2.1, 48);
    geometriesToDispose.push(impactGeo);
    const impactMat = new THREE.MeshBasicMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    materialsToDispose.push(impactMat);
    const impactDisc = new THREE.Mesh(impactGeo, impactMat);
    impactDisc.rotation.x = -Math.PI / 2;
    impactDisc.position.y = 0.03;
    impactDisc.visible = false;
    rootGroup.add(impactDisc);
    impactDiscRef.current = impactDisc;

    // 5. Issue Clusters Group
    const clusterGroup = new THREE.Group();
    rootGroup.add(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    const clusterMeshMap = new Map<string, { mesh: THREE.Mesh; ring: THREE.Mesh; beacon: THREE.Mesh; item: MapClusterItem }>();

    clusters.forEach((item) => {
      const color =
        item.severity === 'critical'
          ? 0xEF4444 // Red
          : item.severity === 'high'
          ? 0x2563EB // Blue
          : item.severity === 'medium'
          ? 0xF59E0B // Amber
          : 0x10B981; // Green

      // Cluster Core Sphere
      const sphereGeo = new THREE.SphereGeometry(0.3, 20, 20);
      geometriesToDispose.push(sphereGeo);
      const sphereMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.15,
      });
      materialsToDispose.push(sphereMat);
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(item.mapPosition[0], item.mapPosition[1] + 0.45, item.mapPosition[2]);
      sphereMesh.userData = { clusterId: item.id, item };
      clusterGroup.add(sphereMesh);

      // Pulse Ring on Ground
      const ringGeo = new THREE.RingGeometry(0.45 * item.radiusScale, 0.6 * item.radiusScale, 32);
      geometriesToDispose.push(ringGeo);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      });
      materialsToDispose.push(ringMat);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.set(item.mapPosition[0], 0.02, item.mapPosition[2]);
      clusterGroup.add(ringMesh);

      // Vertical Light Column / Holographic Pillar
      const beaconGeo = new THREE.CylinderGeometry(0.04, 0.12, 1.8, 16);
      geometriesToDispose.push(beaconGeo);
      const beaconMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
      });
      materialsToDispose.push(beaconMat);
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.set(item.mapPosition[0], 0.9, item.mapPosition[2]);
      clusterGroup.add(beaconMesh);

      // Connection Signal Ray to Resident Hub
      const linePoints = [
        new THREE.Vector3(0, 0.8, 0),
        new THREE.Vector3(item.mapPosition[0], item.mapPosition[1] + 0.45, item.mapPosition[2]),
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
      clusterGroup.add(line);

      clusterMeshMap.set(item.id, {
        mesh: sphereMesh,
        ring: ringMesh,
        beacon: beaconMesh,
        item,
      });
    });

    clusterMeshMapRef.current = clusterMeshMap;

    // 6. Infrastructure Nodes Group
    const infraGroup = new THREE.Group();
    rootGroup.add(infraGroup);
    infraGroupRef.current = infraGroup;

    const infraMeshMap = new Map<string, { mesh: THREE.Mesh; item: InfrastructureNode }>();

    infrastructure.forEach((infra) => {
      let infraColor = 0x14B8A6; // School - Teal
      if (infra.type === 'hospital') infraColor = 0xEC4899; // Pink
      if (infra.type === 'transit') infraColor = 0x6366F1; // Indigo
      if (infra.type === 'utility') infraColor = 0x06B6D4; // Cyan

      const boxGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
      geometriesToDispose.push(boxGeo);
      const boxMat = new THREE.MeshStandardMaterial({
        color: infraColor,
        emissive: infraColor,
        emissiveIntensity: 0.3,
        roughness: 0.2,
      });
      materialsToDispose.push(boxMat);

      const infraMesh = new THREE.Mesh(boxGeo, boxMat);
      infraMesh.position.set(infra.position[0], infra.position[1] + 0.3, infra.position[2]);
      infraMesh.userData = { infraId: infra.id, item: infra };
      infraGroup.add(infraMesh);

      infraMeshMap.set(infra.id, { mesh: infraMesh, item: infra });
    });

    infraMeshMapRef.current = infraMeshMap;

    // 7. Raycasting for Interaction (Hover & Click)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Subtle parallax camera rotation
      if (!prefersReducedMotion && cameraRef.current) {
        gsap.to(rootGroup.rotation, {
          y: mouse.x * 0.06,
          x: -mouse.y * 0.03,
          duration: 0.7,
          ease: 'power1.out',
        });
      }

      raycaster.setFromCamera(mouse, camera);

      // Check Cluster Meshes
      const clusterMeshes = Array.from(clusterMeshMap.values()).map((v) => v.mesh);
      const clusterIntersects = raycaster.intersectObjects(clusterMeshes);

      if (clusterIntersects.length > 0) {
        const hit = clusterIntersects[0].object as THREE.Mesh;
        const item = hit.userData.item as MapClusterItem;
        setHoveredCluster(item);
        setHoveredInfra(null);
        container.style.cursor = 'pointer';
        gsap.to(hit.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.2 });
        return;
      }

      // Check Infra Meshes
      const infraMeshes = Array.from(infraMeshMap.values()).map((v) => v.mesh);
      const infraIntersects = raycaster.intersectObjects(infraMeshes);

      if (infraIntersects.length > 0) {
        const hit = infraIntersects[0].object as THREE.Mesh;
        const item = hit.userData.item as InfrastructureNode;
        setHoveredInfra(item);
        setHoveredCluster(null);
        container.style.cursor = 'pointer';
        gsap.to(hit.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.2 });
        return;
      }

      // Reset hover
      setHoveredCluster(null);
      setHoveredInfra(null);
      container.style.cursor = 'default';
      clusterMeshes.forEach((mesh) => {
        gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
      });
      infraMeshes.forEach((mesh) => {
        gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
      });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const clusterMeshes = Array.from(clusterMeshMap.values()).map((v) => v.mesh);
      const clusterIntersects = raycaster.intersectObjects(clusterMeshes);

      if (clusterIntersects.length > 0) {
        const hit = clusterIntersects[0].object as THREE.Mesh;
        const item = hit.userData.item as MapClusterItem;
        onSelectCluster(item);
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // 8. Resize Observer
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

    // 9. Animation Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Hub Pulse
      if (hubRing) {
        const p = 1 + Math.sin(elapsedTime * 2.2) * 0.15;
        hubRing.scale.set(p, p, 1);
      }

      // Selected Impact Disc gentle pulse
      if (impactDisc && impactDisc.visible) {
        const p = 1 + Math.sin(elapsedTime * 1.8) * 0.06;
        impactDisc.rotation.z += 0.002;
      }

      // Issue Clusters Pulse & Beacon Orbit
      clusterMeshMap.forEach(({ mesh, ring, beacon }) => {
        const p = 1 + Math.sin(elapsedTime * 2.8 + mesh.position.x) * 0.12;
        ring.scale.set(p, p, 1);
        beacon.scale.set(1, 1 + Math.sin(elapsedTime * 2.0) * 0.1, 1);
      });

      // Infrastructure slow bobbing
      infraMeshMap.forEach(({ mesh }, idx) => {
        mesh.rotation.y = elapsedTime * 0.4 + Number(idx);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [clusters, infrastructure, onSelectCluster]);

  // Update Infrastructure Layer Visibility based on filters
  useEffect(() => {
    infraMeshMapRef.current.forEach(({ mesh, item }) => {
      let isVisible = true;
      if (item.type === 'school' && !filters.infrastructure.schools) isVisible = false;
      if (item.type === 'hospital' && !filters.infrastructure.hospitals) isVisible = false;
      if (item.type === 'transit' && !filters.infrastructure.transit) isVisible = false;
      if (item.type === 'utility' && !filters.infrastructure.utilities) isVisible = false;
      mesh.visible = isVisible;
    });
  }, [filters.infrastructure]);

  return (
    <div className="relative w-full h-full bg-[#F4F6F9] overflow-hidden select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="w-full h-full relative" />

      {/* Cluster Hover Tooltip */}
      {hoveredCluster && (
        <div className="absolute top-6 left-6 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E2E8F0] p-4 shadow-xl max-w-xs text-left animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                hoveredCluster.severity === 'critical'
                  ? 'bg-rose-50 text-rose-700'
                  : hoveredCluster.severity === 'high'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-amber-50 text-amber-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hoveredCluster.severity === 'critical'
                    ? 'bg-rose-500'
                    : hoveredCluster.severity === 'high'
                    ? 'bg-blue-600'
                    : 'bg-amber-500'
                }`}
              />
              {hoveredCluster.clusterCode}
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              {hoveredCluster.aiConfidence}% AI Match
            </span>
          </div>

          <h4 className="text-xs font-extrabold text-[#0F172A] leading-snug">
            {hoveredCluster.issueTitle}
          </h4>

          <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2">
            {hoveredCluster.description}
          </p>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono font-semibold">
            <span className="text-[#0F172A]">{hoveredCluster.reportCount} Reports · {hoveredCluster.confirmationCount} Upvotes</span>
            <span className="text-blue-600">Click to Inspect →</span>
          </div>
        </div>
      )}

      {/* Infrastructure Hover Tooltip */}
      {hoveredInfra && (
        <div className="absolute top-6 left-6 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E2E8F0] p-3.5 shadow-xl max-w-xs text-left animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
          <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-bold text-teal-700 uppercase">
            <School className="w-3.5 h-3.5" />
            <span>{hoveredInfra.categoryLabel}</span>
          </div>
          <h4 className="text-xs font-bold text-[#0F172A]">{hoveredInfra.name}</h4>
          <p className="text-[11px] text-[#64748B] mt-0.5">{hoveredInfra.description}</p>
        </div>
      )}
    </div>
  );
};
