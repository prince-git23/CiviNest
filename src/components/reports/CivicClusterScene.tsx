import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CivicClusterSceneProps {
  reportCount?: number;
  confirmationCount?: number;
  category?: string;
  className?: string;
  onHoverNode?: (nodeInfo: string | null) => void;
}

export const CivicClusterScene: React.FC<CivicClusterSceneProps> = ({
  reportCount = 25,
  confirmationCount = 8,
  category = 'lighting',
  className = '',
  onHoverNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 180;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 9.5);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer with safe canvas bounds
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

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0e7ff, 1.4);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 3, 15);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 4. Cluster Group
    const clusterGroup = new THREE.Group();
    scene.add(clusterGroup);

    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];

    // 4a. Coordinate Grid Ring at bottom
    const gridRingGeo = new THREE.RingGeometry(2.4, 2.5, 32);
    const gridRingMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    geometriesToDispose.push(gridRingGeo);
    materialsToDispose.push(gridRingMat);
    const gridRing = new THREE.Mesh(gridRingGeo, gridRingMat);
    gridRing.rotation.x = Math.PI / 2;
    gridRing.position.y = -1.2;
    clusterGroup.add(gridRing);

    // 4b. Central Issue Cluster Node (Cluster Core)
    const centralGeo = new THREE.SphereGeometry(0.7, 24, 24);
    geometriesToDispose.push(centralGeo);
    const centralMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.3,
    });
    materialsToDispose.push(centralMat);
    const centralMesh = new THREE.Mesh(centralGeo, centralMat);
    centralMesh.userData = { type: 'cluster', label: `Civic Cluster (${reportCount} Signals)` };
    clusterGroup.add(centralMesh);

    // Holographic Pulse Ring around Central Core
    const haloGeo = new THREE.RingGeometry(0.85, 1.05, 32);
    geometriesToDispose.push(haloGeo);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    materialsToDispose.push(haloMat);
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 2;
    clusterGroup.add(haloMesh);

    // 4c. Resident Signal Node (Primary User Report)
    const residentPos = new THREE.Vector3(-2.8, 0.4, 0.8);
    const residentGeo = new THREE.SphereGeometry(0.42, 20, 20);
    geometriesToDispose.push(residentGeo);
    const residentMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.9,
      roughness: 0.15,
      metalness: 0.5,
    });
    materialsToDispose.push(residentMat);
    const residentMesh = new THREE.Mesh(residentGeo, residentMat);
    residentMesh.position.copy(residentPos);
    residentMesh.userData = { type: 'resident', label: 'Your Reported Signal' };
    clusterGroup.add(residentMesh);

    // Resident Node Ring Beacon
    const residentRingGeo = new THREE.RingGeometry(0.5, 0.62, 24);
    geometriesToDispose.push(residentRingGeo);
    const residentRingMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    materialsToDispose.push(residentRingMat);
    const residentRing = new THREE.Mesh(residentRingGeo, residentRingMat);
    residentRing.rotation.x = Math.PI / 2;
    residentRing.position.copy(residentPos);
    residentRing.position.y -= 0.2;
    clusterGroup.add(residentRing);

    // 4d. Related Anonymous Signal Nodes (Neighbors / Confirmations)
    const relatedCount = Math.min(Math.max(confirmationCount, 5), 10);
    const relatedNodes: { mesh: THREE.Mesh; basePos: THREE.Vector3; angle: number; radius: number; speed: number }[] = [];

    const relatedGeo = new THREE.SphereGeometry(0.24, 16, 16);
    geometriesToDispose.push(relatedGeo);
    const relatedMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      emissive: 0x94a3b8,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });
    materialsToDispose.push(relatedMat);

    for (let i = 0; i < relatedCount; i++) {
      const angle = (i / relatedCount) * Math.PI * 1.6 + 0.4;
      const radius = 2.4 + (Math.sin(i * 1.7) * 0.5);
      const posX = Math.cos(angle) * radius;
      const posZ = Math.sin(angle) * radius;
      const posY = (Math.sin(i * 2.3) * 0.8);

      const rMesh = new THREE.Mesh(relatedGeo, relatedMat);
      const basePos = new THREE.Vector3(posX, posY, posZ);
      rMesh.position.copy(basePos);
      rMesh.userData = { type: 'related', label: `Neighbor Confirmation #${i + 1}` };
      clusterGroup.add(rMesh);

      relatedNodes.push({
        mesh: rMesh,
        basePos,
        angle,
        radius,
        speed: 0.2 + (i % 3) * 0.1,
      });

      // Connecting line from related node to central cluster
      const linePoints = [basePos, new THREE.Vector3(0, 0, 0)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      geometriesToDispose.push(lineGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.25,
      });
      materialsToDispose.push(lineMat);
      const line = new THREE.Line(lineGeo, lineMat);
      clusterGroup.add(line);
    }

    // 4e. Main Highlight Connection: Resident Signal -> Central Cluster
    const mainCurvePoints = [];
    const midPoint = new THREE.Vector3().addVectors(residentPos, new THREE.Vector3(0, 0, 0)).multiplyScalar(0.5);
    midPoint.y += 0.6; // gentle arc
    const curve = new THREE.QuadraticBezierCurve3(residentPos, midPoint, new THREE.Vector3(0, 0, 0));
    mainCurvePoints.push(...curve.getPoints(24));

    const mainLineGeo = new THREE.BufferGeometry().setFromPoints(mainCurvePoints);
    geometriesToDispose.push(mainLineGeo);
    const mainLineMat = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.85,
    });
    materialsToDispose.push(mainLineMat);
    const mainLine = new THREE.Line(mainLineGeo, mainLineMat);
    clusterGroup.add(mainLine);

    // 4f. Flowing Energy Pulse on Main Connection Line
    const pulseGeo = new THREE.SphereGeometry(0.12, 12, 12);
    geometriesToDispose.push(pulseGeo);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
    materialsToDispose.push(pulseMat);
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    clusterGroup.add(pulseMesh);

    // 5. Raycasting for Node Hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactableMeshes = [centralMesh, residentMesh, ...relatedNodes.map((r) => r.mesh)];
      const intersects = raycaster.intersectObjects(interactableMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (onHoverNode && hit.userData.label) {
          onHoverNode(hit.userData.label);
        }
        container.style.cursor = 'pointer';
      } else {
        if (onHoverNode) onHoverNode(null);
        container.style.cursor = 'default';
      }
    };

    container.addEventListener('mousemove', handlePointerMove, { passive: true });

    // 6. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let pulseProgress = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Slow ambient cluster rotation
        clusterGroup.rotation.y = elapsedTime * 0.15;

        // Central core breathing
        const coreScale = 1 + Math.sin(elapsedTime * 2.5) * 0.05;
        centralMesh.scale.set(coreScale, coreScale, coreScale);

        const haloScale = 1 + Math.sin(elapsedTime * 3) * 0.12;
        haloMesh.scale.set(haloScale, haloScale, 1);

        // Resident beacon pulse
        const resRingScale = 1 + Math.sin(elapsedTime * 4) * 0.2;
        residentRing.scale.set(resRingScale, resRingScale, 1);

        // Subtle floating on related nodes
        relatedNodes.forEach((node, i) => {
          node.mesh.position.y = node.basePos.y + Math.sin(elapsedTime * 2 + i) * 0.1;
        });

        // Flowing energy pulse from resident node to central cluster
        pulseProgress += 0.015;
        if (pulseProgress > 1) pulseProgress = 0;
        const pt = curve.getPoint(pulseProgress);
        pulseMesh.position.copy(pt);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handlePointerMove);

      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [reportCount, confirmationCount, category, onHoverNode]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[180px] sm:h-[210px] select-none pointer-events-auto overflow-hidden rounded-xl bg-[#0F172A]/5 border border-[#E2E8F0] ${className}`}
      aria-label="3D Civic Cluster Signal Visualization"
    />
  );
};

export default CivicClusterScene;
