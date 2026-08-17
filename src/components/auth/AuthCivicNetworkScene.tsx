import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { UserRoleConfig } from '../../types';
import { NEUTRAL_CAMERA } from './rolesData';

interface AuthCivicNetworkSceneProps {
  activeRole: UserRoleConfig | null;
  hoverRole: UserRoleConfig | null;
  className?: string;
}

export const AuthCivicNetworkScene: React.FC<AuthCivicNetworkSceneProps> = ({
  activeRole,
  hoverRole,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.5, 0));
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Initialize Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0A111F); // Atmospheric deep navy background
    scene.fog = new THREE.FogExp2(0x0A111F, 0.024);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 700;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(...NEUTRAL_CAMERA.position);
    camera.lookAt(...NEUTRAL_CAMERA.target);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x93C5FD, 1.6);
    dirLight.position.set(16, 24, 16);
    scene.add(dirLight);

    const hubPointLight = new THREE.PointLight(0x3B82F6, 3.5, 25);
    hubPointLight.position.set(0, 3.5, 0);
    scene.add(hubPointLight);

    const residentClusterLight = new THREE.PointLight(0x10B981, 2.0, 18);
    residentClusterLight.position.set(-6, 2.5, 5);
    scene.add(residentClusterLight);

    const amberLight = new THREE.PointLight(0xF59E0B, 1.8, 15);
    amberLight.position.set(5, 3, -4);
    scene.add(amberLight);

    // 5. City & Network Geometries
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // Coordinate Grid Helper
    const gridHelper = new THREE.GridHelper(26, 26, 0x1E293B, 0x0F1E36);
    gridHelper.position.y = -0.02;
    cityGroup.add(gridHelper);

    // Track disposables
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    // Building Materials
    const darkBuildingMat = new THREE.MeshStandardMaterial({
      color: 0x132238,
      roughness: 0.25,
      metalness: 0.45,
    });
    materialsToDispose.push(darkBuildingMat);

    const residentBuildingMat = new THREE.MeshStandardMaterial({
      color: 0x1E3A5F,
      roughness: 0.3,
      metalness: 0.3,
    });
    materialsToDispose.push(residentBuildingMat);

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.35,
    });
    materialsToDispose.push(edgeMat);

    const residentEdgeMat = new THREE.LineBasicMaterial({
      color: 0x34D399,
      transparent: true,
      opacity: 0.5,
    });
    materialsToDispose.push(residentEdgeMat);

    // Generate Urban Blocks
    const buildingCount = 36;
    for (let i = 0; i < buildingCount; i++) {
      const gx = ((i % 6) - 2.5) * 2.5 + (Math.sin(i * 1.3) * 0.4);
      const gz = (Math.floor(i / 6) - 2.5) * 2.5 + (Math.cos(i * 1.7) * 0.4);

      // Keep central hub clearing
      if (Math.abs(gx) < 1.8 && Math.abs(gz) < 1.8) continue;

      const isResidentialZone = gx < -1.5 && gz > 1.0;
      const w = 1.1 + (Math.sin(i * 4) * 0.3);
      const d = 1.1 + (Math.cos(i * 3) * 0.3);
      const h = isResidentialZone
        ? 0.9 + Math.abs(Math.sin(i * 2.5)) * 1.4
        : 1.2 + Math.abs(Math.sin(i * 3.2)) * 3.2;

      const geom = new THREE.BoxGeometry(w, h, d);
      geometriesToDispose.push(geom);

      const mat = isResidentialZone ? residentBuildingMat : darkBuildingMat;
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(gx, h / 2, gz);
      cityGroup.add(mesh);

      // Architectural Edge lines
      const edgeGeo = new THREE.EdgesGeometry(geom);
      geometriesToDispose.push(edgeGeo);
      const edgeMesh = new THREE.LineSegments(
        edgeGeo,
        isResidentialZone ? residentEdgeMat : edgeMat
      );
      edgeMesh.position.copy(mesh.position);
      cityGroup.add(edgeMesh);
    }

    // 6. Central Civic Intelligence Hub
    const hubBaseGeo = new THREE.CylinderGeometry(1.6, 2.0, 0.5, 8);
    const hubBaseMat = new THREE.MeshStandardMaterial({
      color: 0x1E293B,
      roughness: 0.2,
      metalness: 0.8,
    });
    geometriesToDispose.push(hubBaseGeo);
    materialsToDispose.push(hubBaseMat);
    const hubBase = new THREE.Mesh(hubBaseGeo, hubBaseMat);
    hubBase.position.set(0, 0.25, 0);
    cityGroup.add(hubBase);

    // Floating Core Octahedron
    const coreGeo = new THREE.OctahedronGeometry(0.75, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x60A5FA,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x1D4ED8,
      emissiveIntensity: 0.8,
    });
    geometriesToDispose.push(coreGeo);
    materialsToDispose.push(coreMat);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 2.2, 0);
    cityGroup.add(coreMesh);

    // Orbital Rings
    const ring1Geo = new THREE.TorusGeometry(2.2, 0.035, 16, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.75,
    });
    geometriesToDispose.push(ring1Geo);
    materialsToDispose.push(ring1Mat);
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.set(0, 1.4, 0);
    cityGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.7, 0.025, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x818CF8,
      transparent: true,
      opacity: 0.55,
    });
    geometriesToDispose.push(ring2Geo);
    materialsToDispose.push(ring2Mat);
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 2.3;
    ring2.rotation.y = Math.PI / 6;
    ring2.position.set(0, 1.8, 0);
    cityGroup.add(ring2);

    // 7. Signal Spline Trajectories & Pulse Packets
    const signalRoutes: {
      curve: THREE.QuadraticBezierCurve3;
      tube: THREE.Line;
      packets: THREE.Mesh[];
    }[] = [];

    const nodeOrigins = [
      new THREE.Vector3(-6.5, 1.8, 4.5), // Citizen node 1
      new THREE.Vector3(-4.8, 2.2, 5.8), // Citizen node 2
      new THREE.Vector3(-3.2, 1.5, -5.2), // Citizen node 3
      new THREE.Vector3(5.2, 2.4, -4.5),  // Community cluster node
      new THREE.Vector3(6.0, 1.6, 3.8),   // Field reporter node
      new THREE.Vector3(-5.5, 2.8, -2.0), // Ward sensor
    ];

    const hubTarget = new THREE.Vector3(0, 2.0, 0);

    // Create Signal Beacons at Origins
    const beaconGeo = new THREE.SphereGeometry(0.18, 16, 16);
    geometriesToDispose.push(beaconGeo);
    nodeOrigins.forEach((origin, idx) => {
      const isGreen = idx < 2;
      const bMat = new THREE.MeshBasicMaterial({
        color: isGreen ? 0x34D399 : 0x60A5FA,
      });
      materialsToDispose.push(bMat);
      const beacon = new THREE.Mesh(beaconGeo, bMat);
      beacon.position.copy(origin);
      cityGroup.add(beacon);

      // Trajectory curve
      const midPoint = new THREE.Vector3()
        .addVectors(origin, hubTarget)
        .multiplyScalar(0.5);
      midPoint.y += 2.2 + idx * 0.3; // Arching bezier path

      const curve = new THREE.QuadraticBezierCurve3(origin, midPoint, hubTarget);
      const points = curve.getPoints(32);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      geometriesToDispose.push(lineGeo);

      const lineMat = new THREE.LineBasicMaterial({
        color: isGreen ? 0x10B981 : 0x3B82F6,
        transparent: true,
        opacity: 0.35,
      });
      materialsToDispose.push(lineMat);
      const tubeLine = new THREE.Line(lineGeo, lineMat);
      cityGroup.add(tubeLine);

      // Packet meshes
      const packetGeo = new THREE.SphereGeometry(0.12, 12, 12);
      geometriesToDispose.push(packetGeo);
      const packetMat = new THREE.MeshBasicMaterial({
        color: isGreen ? 0x6EE7B7 : 0x93C5FD,
      });
      materialsToDispose.push(packetMat);

      const packetMesh1 = new THREE.Mesh(packetGeo, packetMat);
      const packetMesh2 = new THREE.Mesh(packetGeo, packetMat);
      cityGroup.add(packetMesh1);
      cityGroup.add(packetMesh2);

      signalRoutes.push({
        curve,
        tube: tubeLine,
        packets: [packetMesh1, packetMesh2],
      });
    });

    // 8. Pointer Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 1.5;
      mouseY = y * 1.2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 9. Resize Handling
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

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle slow rotation of the hub & orbital rings
      if (!prefersReducedMotion) {
        coreMesh.rotation.y = elapsedTime * 0.5;
        coreMesh.rotation.x = elapsedTime * 0.25;
        ring1.rotation.z = elapsedTime * 0.3;
        ring2.rotation.z = -elapsedTime * 0.25;

        // Animate packets along bezier curves
        signalRoutes.forEach((route, rIdx) => {
          route.packets.forEach((packet, pIdx) => {
            const speed = 0.35 + (rIdx % 3) * 0.08;
            const progress = (elapsedTime * speed + (pIdx * 0.5) + (rIdx * 0.2)) % 1;
            const pos = route.curve.getPointAt(progress);
            packet.position.copy(pos);
            const scale = 0.7 + Math.sin(progress * Math.PI) * 0.6;
            packet.scale.set(scale, scale, scale);
          });
        });

        // Slight hovering motion of core
        coreMesh.position.y = 2.2 + Math.sin(elapsedTime * 1.8) * 0.12;

        // Apply mouse parallax smoothly to group
        cityGroup.rotation.y = THREE.MathUtils.lerp(cityGroup.rotation.y, mouseX * 0.12, 0.05);
        cityGroup.rotation.x = THREE.MathUtils.lerp(cityGroup.rotation.x, -mouseY * 0.08, 0.05);
      }

      // Camera lookAt current target
      camera.lookAt(targetRef.current);
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Handle GSAP Camera Transition when activeRole or hoverRole changes
  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetConfig = activeRole || hoverRole;

    const targetPos = targetConfig ? targetConfig.cameraPosition : NEUTRAL_CAMERA.position;
    const targetLook = targetConfig ? targetConfig.cameraTarget : NEUTRAL_CAMERA.target;

    if (prefersReducedMotion) {
      camera.position.set(...targetPos);
      targetRef.current.set(...targetLook);
      camera.lookAt(targetRef.current);
      return;
    }

    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    const duration = 1.4;
    const ease = 'power3.out';

    // Camera position interpolation
    gsap.to(camera.position, {
      x: targetPos[0],
      y: targetPos[1],
      z: targetPos[2],
      duration,
      ease,
    });

    // LookAt target interpolation
    tweenRef.current = gsap.to(targetRef.current, {
      x: targetLook[0],
      y: targetLook[1],
      z: targetLook[2],
      duration,
      ease,
    });
  }, [activeRole, hoverRole]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden select-none bg-[#0A111F] ${className}`}
      aria-label="CiviNest 3D Civic Mesh Network Viewport"
    />
  );
};

export default AuthCivicNetworkScene;
