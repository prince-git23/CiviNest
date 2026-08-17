import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CivicNetworkSceneProps {
  className?: string;
  interactive?: boolean;
}

export const CivicNetworkScene: React.FC<CivicNetworkSceneProps> = ({
  className = '',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    // Soft atmospheric background fog matching the app light canvas
    scene.fog = new THREE.FogExp2(0xFBFBFA, 0.022);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 14, 18);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xdce7f9, 1.2);
    dirLight.position.set(15, 25, 15);
    scene.add(dirLight);

    const bluePointLight = new THREE.PointLight(0x2563EB, 2.5, 30);
    bluePointLight.position.set(0, 4, 0);
    scene.add(bluePointLight);

    const coralPointLight = new THREE.PointLight(0xEF4444, 1.8, 20);
    coralPointLight.position.set(4, 3, -3);
    scene.add(coralPointLight);

    // 4. Geometry Root Group
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // 4a. Ground Civic Coordinate Grid
    const gridSize = 24;
    const gridDivisions = 24;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xCBD5E1, 0xE2E8F0);
    gridHelper.position.y = -0.05;
    cityGroup.add(gridHelper);

    // 4b. Abstract Low-Poly City Blocks
    const buildingGeometries: THREE.BufferGeometry[] = [];
    const buildingMaterials: THREE.Material[] = [];

    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0xEEF2F6,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
    });
    buildingMaterials.push(buildingMat);

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x94A3B8,
      transparent: true,
      opacity: 0.4,
    });
    buildingMaterials.push(edgeMat);

    const buildingCount = 28;
    const buildingPositions: { x: number; z: number; h: number; mesh: THREE.Mesh }[] = [];

    // Deterministic pseudo-random placement in an urban grid cluster
    for (let i = 0; i < buildingCount; i++) {
      const gx = ((i % 6) - 2.5) * 2.6 + (Math.sin(i * 1.5) * 0.4);
      const gz = (Math.floor(i / 6) - 2) * 2.6 + (Math.cos(i * 1.8) * 0.4);
      
      // Keep central plaza clear for the Civic Intelligence Hub
      if (Math.abs(gx) < 1.8 && Math.abs(gz) < 1.8) continue;

      const w = 1.0 + (Math.sin(i * 7) * 0.3);
      const d = 1.0 + (Math.cos(i * 5) * 0.3);
      const h = 0.8 + Math.abs(Math.sin(i * 3.7)) * 2.8;

      const geom = new THREE.BoxGeometry(w, h, d);
      buildingGeometries.push(geom);
      const buildingMesh = new THREE.Mesh(geom, buildingMat);
      buildingMesh.position.set(gx, h / 2, gz);
      cityGroup.add(buildingMesh);

      // Clean architectural edges
      const wireGeo = new THREE.EdgesGeometry(geom);
      buildingGeometries.push(wireGeo);
      const wireframe = new THREE.LineSegments(wireGeo, edgeMat);
      wireframe.position.copy(buildingMesh.position);
      cityGroup.add(wireframe);

      buildingPositions.push({ x: gx, z: gz, h, mesh: buildingMesh });
    }

    // 4c. Central Civic Intelligence Hub
    const hubBaseGeo = new THREE.CylinderGeometry(1.6, 2.0, 0.4, 8);
    const hubBaseMat = new THREE.MeshStandardMaterial({
      color: 0x0F1E36,
      roughness: 0.2,
      metalness: 0.6,
    });
    buildingGeometries.push(hubBaseGeo);
    buildingMaterials.push(hubBaseMat);
    const hubBase = new THREE.Mesh(hubBaseGeo, hubBaseMat);
    hubBase.position.set(0, 0.2, 0);
    cityGroup.add(hubBase);

    // Floating Holographic Ring around the Hub
    const ringGeo = new THREE.TorusGeometry(2.4, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.7,
    });
    buildingGeometries.push(ringGeo);
    buildingMaterials.push(ringMat);
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, 0.8, 0);
    cityGroup.add(ringMesh);

    // 4d. Dynamic Signal Nodes (Citizens -> Signals -> Intelligence)
    const nodeCount = 14;
    const signalNodes: {
      mesh: THREE.Mesh;
      basePos: THREE.Vector3;
      phase: number;
      speed: number;
      isCritical: boolean;
      beacon?: THREE.Mesh;
    }[] = [];

    const nodeGeo = new THREE.SphereGeometry(0.22, 16, 16);
    buildingGeometries.push(nodeGeo);

    const normalNodeMat = new THREE.MeshStandardMaterial({
      color: 0x2563EB,
      emissive: 0x1D4ED8,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });
    const criticalNodeMat = new THREE.MeshStandardMaterial({
      color: 0xEF4444,
      emissive: 0xDC2626,
      emissiveIntensity: 1.0,
      roughness: 0.1,
    });
    const verifiedNodeMat = new THREE.MeshStandardMaterial({
      color: 0x10B981,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
      roughness: 0.1,
    });
    buildingMaterials.push(normalNodeMat, criticalNodeMat, verifiedNodeMat);

    for (let i = 0; i < nodeCount; i++) {
      const isCritical = i === 2 || i === 7;
      const isVerified = i === 0 || i === 4;
      const mat = isCritical ? criticalNodeMat : isVerified ? verifiedNodeMat : normalNodeMat;
      const nodeMesh = new THREE.Mesh(nodeGeo, mat);

      const targetB = buildingPositions[i % buildingPositions.length];
      const posX = targetB ? targetB.x : (Math.random() - 0.5) * 10;
      const posZ = targetB ? targetB.z : (Math.random() - 0.5) * 10;
      const posY = (targetB ? targetB.h : 1.5) + 0.6 + Math.random() * 0.8;

      const basePos = new THREE.Vector3(posX, posY, posZ);
      nodeMesh.position.copy(basePos);
      cityGroup.add(nodeMesh);

      // Light pulsing beacon for critical signal
      let beacon: THREE.Mesh | undefined;
      if (isCritical) {
        const beaconGeo = new THREE.RingGeometry(0.25, 0.45, 16);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: 0xEF4444,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        });
        buildingGeometries.push(beaconGeo);
        buildingMaterials.push(beaconMat);
        beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.rotation.x = Math.PI / 2;
        beacon.position.copy(basePos);
        cityGroup.add(beacon);
      }

      signalNodes.push({
        mesh: nodeMesh,
        basePos,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.8,
        isCritical,
        beacon,
      });
    }

    // 4e. Signal Network Connection Arcs
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x3B82F6,
      transparent: true,
      opacity: 0.35,
    });
    buildingMaterials.push(lineMat);

    const hubTarget = new THREE.Vector3(0, 1.2, 0);
    const lineObjects: THREE.Line[] = [];

    signalNodes.forEach((node, idx) => {
      // Connect to hub or to neighbor
      const target = idx % 2 === 0 ? hubTarget : signalNodes[(idx + 1) % signalNodes.length].basePos;
      const points = [];
      const mid = new THREE.Vector3()
        .addVectors(node.basePos, target)
        .multiplyScalar(0.5);
      mid.y += 1.2; // graceful bezier arc

      const curve = new THREE.QuadraticBezierCurve3(node.basePos, mid, target);
      points.push(...curve.getPoints(20));

      const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
      buildingGeometries.push(curveGeo);
      const line = new THREE.Line(curveGeo, lineMat);
      cityGroup.add(line);
      lineObjects.push(line);
    });

    // 4f. Floating Data Packets / Pulses along the network
    const packetCount = 8;
    const packetGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const packetMat = new THREE.MeshBasicMaterial({
      color: 0x60A5FA,
    });
    buildingGeometries.push(packetGeo);
    buildingMaterials.push(packetMat);

    const packets: { mesh: THREE.Mesh; nodeIdx: number; progress: number; speed: number }[] = [];
    for (let p = 0; p < packetCount; p++) {
      const pMesh = new THREE.Mesh(packetGeo, packetMat);
      cityGroup.add(pMesh);
      packets.push({
        mesh: pMesh,
        nodeIdx: p % signalNodes.length,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.006,
      });
    }

    // 5. Mouse Interaction / Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x * 2;
      mouseY = y * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 6. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW === 0 || newH === 0) return;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();

      if (!prefersReducedMotion) {
        // Calm base rotation
        targetRotationY += 0.0015;

        // Mouse Parallax interpolation
        cityGroup.rotation.y += (targetRotationY + mouseX * 0.25 - cityGroup.rotation.y) * 0.05;
        cityGroup.rotation.x += (-mouseY * 0.15 - cityGroup.rotation.x) * 0.05;

        // Animate floating nodes
        signalNodes.forEach((node) => {
          const floatOffset = Math.sin(elapsedTime * node.speed + node.phase) * 0.18;
          node.mesh.position.y = node.basePos.y + floatOffset;

          if (node.beacon) {
            const scale = 1 + Math.sin(elapsedTime * 4 + node.phase) * 0.4;
            node.beacon.scale.set(scale, scale, scale);
            (node.beacon.material as THREE.MeshBasicMaterial).opacity =
              0.4 + Math.cos(elapsedTime * 4 + node.phase) * 0.4;
            node.beacon.position.y = node.basePos.y + floatOffset;
          }
        });

        // Rotate holographic hub ring
        ringMesh.rotation.z = elapsedTime * 0.5;
        const ringScale = 1 + Math.sin(elapsedTime * 2) * 0.04;
        ringMesh.scale.set(ringScale, ringScale, 1);

        // Animate data packets travelling from citizen nodes to central hub
        packets.forEach((packet) => {
          packet.progress += packet.speed;
          if (packet.progress > 1) {
            packet.progress = 0;
            packet.nodeIdx = Math.floor(Math.random() * signalNodes.length);
          }
          const node = signalNodes[packet.nodeIdx];
          if (node) {
            // Lerp along arc to hub
            const start = node.mesh.position;
            const end = hubTarget;
            packet.mesh.position.lerpVectors(start, end, packet.progress);
            packet.mesh.position.y += Math.sin(packet.progress * Math.PI) * 0.8;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup Function
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      // Dispose Three.js objects
      buildingGeometries.forEach((geo) => geo.dispose());
      buildingMaterials.forEach((mat) => mat.dispose());
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[380px] select-none pointer-events-auto overflow-hidden ${className}`}
      aria-label="Interactive 3D Civic Network Scene"
    />
  );
};

export default CivicNetworkScene;
