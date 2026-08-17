import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { PrioritizedIssue } from '../../types';

interface CommunityMapSceneProps {
  issues: PrioritizedIssue[];
  onIssueSelect: (issue: PrioritizedIssue) => void;
  className?: string;
}

export const CommunityMapScene: React.FC<CommunityMapSceneProps> = ({
  issues,
  onIssueSelect,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFBFBFA, 0.018);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 16, 20);
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

    // 4. Geometry Root Group
    const communityGroup = new THREE.Group();
    scene.add(communityGroup);

    // 4a. Ground Grid
    const gridSize = 24;
    const gridDivisions = 24;
    const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xCBD5E1, 0xE2E8F0);
    gridHelper.position.y = -0.05;
    communityGroup.add(gridHelper);

    // 4b. Community Boundary
    const boundaryGeo = new THREE.RingGeometry(10, 10.2, 32);
    const boundaryMat = new THREE.MeshBasicMaterial({
      color: 0x2563EB,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const boundary = new THREE.Mesh(boundaryGeo, boundaryMat);
    boundary.rotation.x = Math.PI / 2;
    boundary.position.y = 0.01;
    communityGroup.add(boundary);

    // 4c. Buildings (Community Structures)
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

    const buildingCount = 32;
    const buildingPositions: { x: number; z: number; h: number; mesh: THREE.Mesh }[] = [];

    for (let i = 0; i < buildingCount; i++) {
      const gx = ((i % 8) - 3.5) * 2.2 + (Math.sin(i * 1.5) * 0.3);
      const gz = (Math.floor(i / 8) - 2) * 2.2 + (Math.cos(i * 1.8) * 0.3);
      
      // Keep central plaza clear
      if (Math.abs(gx) < 2 && Math.abs(gz) < 2) continue;

      const w = 0.8 + (Math.sin(i * 7) * 0.2);
      const d = 0.8 + (Math.cos(i * 5) * 0.2);
      const h = 0.6 + Math.abs(Math.sin(i * 3.7)) * 2.2;

      const geom = new THREE.BoxGeometry(w, h, d);
      buildingGeometries.push(geom);
      const buildingMesh = new THREE.Mesh(geom, buildingMat);
      buildingMesh.position.set(gx, h / 2, gz);
      communityGroup.add(buildingMesh);

      // Clean architectural edges
      const wireGeo = new THREE.EdgesGeometry(geom);
      buildingGeometries.push(wireGeo);
      const wireframe = new THREE.LineSegments(wireGeo, edgeMat);
      wireframe.position.copy(buildingMesh.position);
      communityGroup.add(wireframe);

      buildingPositions.push({ x: gx, z: gz, h, mesh: buildingMesh });
    }

    // 4d. Roads
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x94A3B8,
      roughness: 0.8,
      metalness: 0.1,
    });
    buildingMaterials.push(roadMat);

    // Main road
    const mainRoadGeo = new THREE.BoxGeometry(12, 0.05, 0.8);
    const mainRoad = new THREE.Mesh(mainRoadGeo, roadMat);
    mainRoad.position.set(0, 0.025, 0);
    communityGroup.add(mainRoad);

    // Secondary road
    const secondaryRoadGeo = new THREE.BoxGeometry(0.8, 0.05, 12);
    const secondaryRoad = new THREE.Mesh(secondaryRoadGeo, roadMat);
    secondaryRoad.position.set(0, 0.025, 0);
    communityGroup.add(secondaryRoad);

    // 4e. Issue Markers (3D Nodes)
    const issueNodeMat = new THREE.MeshStandardMaterial({
      color: 0xEF4444,
      emissive: 0xDC2626,
      emissiveIntensity: 1.0,
      roughness: 0.1,
    });
    buildingMaterials.push(issueNodeMat);

    const issueNodeGeo = new THREE.SphereGeometry(0.3, 16, 16);
    buildingGeometries.push(issueNodeGeo);

    const issueNodes: { mesh: THREE.Mesh; issue: PrioritizedIssue; basePos: THREE.Vector3 }[] = [];
    const issuePositions = [
      { x: -3, z: -2 },
      { x: 2, z: 3 },
      { x: -4, z: 1 },
      { x: 3, z: -3 },
    ];

    issues.forEach((issue, idx) => {
      if (idx >= issuePositions.length) return;
      
      const nodeMesh = new THREE.Mesh(issueNodeGeo, issueNodeMat.clone());
      const pos = issuePositions[idx];
      const basePos = new THREE.Vector3(pos.x, 1.5, pos.z);
      nodeMesh.position.copy(basePos);
      communityGroup.add(nodeMesh);

      // Pulsing ring around issue
      const ringGeo = new THREE.RingGeometry(0.4, 0.5, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xEF4444,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      buildingGeometries.push(ringGeo);
      buildingMaterials.push(ringMat);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.copy(basePos);
      ring.position.y = 0.05;
      communityGroup.add(ring);

      issueNodes.push({ mesh: nodeMesh, issue, basePos });
    });

    // 5. Mouse Interaction / Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
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

      if (!prefersReducedMotion) {
        // Calm base rotation
        targetRotationY += 0.001;

        // Mouse Parallax interpolation
        communityGroup.rotation.y += (targetRotationY + mouseX * 0.2 - communityGroup.rotation.y) * 0.05;
        communityGroup.rotation.x += (-mouseY * 0.1 - communityGroup.rotation.x) * 0.05;

        // Animate issue nodes
        issueNodes.forEach((node, idx) => {
          const floatOffset = Math.sin(elapsedTime * 1.5 + idx) * 0.2;
          node.mesh.position.y = node.basePos.y + floatOffset;
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
  }, [issues]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[380px] select-none pointer-events-auto overflow-hidden ${className}`}
      aria-label="Interactive 3D Community Map"
    />
  );
};

export default CommunityMapScene;
