import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CivicWorkflowSceneProps {
  className?: string;
  interactive?: boolean;
}

export const CivicWorkflowScene: React.FC<CivicWorkflowSceneProps> = ({
  className = '',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFBFBFA, 0.02);

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(14, 16, 16);
    camera.lookAt(0, 1.5, 0);

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

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainDirLight = new THREE.DirectionalLight(0xdbeafe, 1.4);
    mainDirLight.position.set(16, 28, 20);
    scene.add(mainDirLight);

    const hubPointLight = new THREE.PointLight(0x2563EB, 3.2, 25);
    hubPointLight.position.set(0, 3, 0);
    scene.add(hubPointLight);

    const accentPointLight = new THREE.PointLight(0x60A5FA, 2.0, 20);
    accentPointLight.position.set(-6, 4, 6);
    scene.add(accentPointLight);

    // 4. City & Workflow Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 4a. Ground Civic Grid
    const gridHelper = new THREE.GridHelper(24, 24, 0x94A3B8, 0xE2E8F0);
    gridHelper.position.y = -0.05;
    rootGroup.add(gridHelper);

    // 4b. Low-Poly City Blocks
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0xEEF2F6,
      roughness: 0.3,
      metalness: 0.08,
      transparent: true,
      opacity: 0.85,
    });

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x94A3B8,
      transparent: true,
      opacity: 0.35,
    });

    const buildingCount = 26;
    const buildingMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < buildingCount; i++) {
      const gx = ((i % 6) - 2.5) * 2.8 + (Math.sin(i * 1.8) * 0.4);
      const gz = (Math.floor(i / 6) - 2) * 2.8 + (Math.cos(i * 1.4) * 0.4);

      // Keep center open for the central intelligence hub
      const distFromCenter = Math.sqrt(gx * gx + gz * gz);
      if (distFromCenter < 2.8) continue;

      const heightVal = 0.8 + (Math.sin(i * 99) * 0.5 + 0.5) * 2.4;
      const widthVal = 1.0 + (Math.cos(i * 33) * 0.5 + 0.5) * 0.7;
      const depthVal = 1.0 + (Math.sin(i * 77) * 0.5 + 0.5) * 0.7;

      const geom = new THREE.BoxGeometry(widthVal, heightVal, depthVal);
      const mesh = new THREE.Mesh(geom, buildingMat);
      mesh.position.set(gx, heightVal / 2, gz);

      // Edges for architectural contouring
      const edges = new THREE.EdgesGeometry(geom);
      const line = new THREE.LineSegments(edges, edgeMat);
      mesh.add(line);

      rootGroup.add(mesh);
      buildingMeshes.push(mesh);
    }

    // 4c. Central Municipal Intelligence Hub
    const hubGroup = new THREE.Group();
    hubGroup.position.set(0, 0, 0);
    rootGroup.add(hubGroup);

    // Central Glass/Holographic Core
    const hubCoreGeom = new THREE.OctahedronGeometry(1.2, 1);
    const hubCoreMat = new THREE.MeshStandardMaterial({
      color: 0x0F1E36,
      emissive: 0x1D4ED8,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: false,
    });
    const hubCoreMesh = new THREE.Mesh(hubCoreGeom, hubCoreMat);
    hubCoreMesh.position.y = 2.0;
    hubGroup.add(hubCoreMesh);

    // Outer Wireframe Cage
    const hubCageGeom = new THREE.IcosahedronGeometry(1.6, 1);
    const hubCageMat = new THREE.MeshBasicMaterial({
      color: 0x3B82F6,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const hubCageMesh = new THREE.Mesh(hubCageGeom, hubCageMat);
    hubCageMesh.position.y = 2.0;
    hubGroup.add(hubCageMesh);

    // Concentric Orbital Rings
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x2563EB,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });

    const ringGeom1 = new THREE.RingGeometry(2.2, 2.26, 48);
    const ring1 = new THREE.Mesh(ringGeom1, ringMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 0.2;
    hubGroup.add(ring1);

    const ringGeom2 = new THREE.RingGeometry(3.2, 3.25, 48);
    const ring2 = new THREE.Mesh(ringGeom2, ringMat);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = 0.15;
    hubGroup.add(ring2);

    // 4d. Peripheral Citizen Signal Origin Nodes
    const originPositions = [
      new THREE.Vector3(-6.5, 0.4, -4.5),
      new THREE.Vector3(7.0, 0.4, -5.2),
      new THREE.Vector3(-5.8, 0.4, 6.2),
      new THREE.Vector3(6.2, 0.4, 5.8),
      new THREE.Vector3(0.5, 0.4, -7.5),
      new THREE.Vector3(-7.2, 0.4, 1.0),
    ];

    const nodeGeom = new THREE.SphereGeometry(0.28, 16, 16);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x2563EB,
      emissive: 0x3B82F6,
      emissiveIntensity: 0.8,
    });

    const ringNodeMat = new THREE.MeshBasicMaterial({
      color: 0x60A5FA,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });

    originPositions.forEach((pos) => {
      const node = new THREE.Mesh(nodeGeom, nodeMat);
      node.position.copy(pos);
      rootGroup.add(node);

      const pRing = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.48, 24), ringNodeMat);
      pRing.rotation.x = -Math.PI / 2;
      pRing.position.set(pos.x, 0.05, pos.z);
      rootGroup.add(pRing);
    });

    // 4e. Signal Flow Curves & Pulses Travelling toward Hub
    const curvePaths: THREE.CatmullRomCurve3[] = [];
    const curveLines: THREE.Line[] = [];

    originPositions.forEach((pos) => {
      // Midpoint with height elevation
      const mid = new THREE.Vector3(
        pos.x * 0.5,
        1.8 + Math.random() * 0.8,
        pos.z * 0.5
      );
      const end = new THREE.Vector3(0, 2.0, 0);

      const curve = new THREE.CatmullRomCurve3([pos, mid, end]);
      curvePaths.push(curve);

      const points = curve.getPoints(40);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x93C5FD,
        transparent: true,
        opacity: 0.4,
      });
      const curveLine = new THREE.Line(lineGeom, lineMat);
      rootGroup.add(curveLine);
      curveLines.push(curveLine);
    });

    // Data packet signals flowing continuously along curves
    const packetCount = 14;
    const packetGeom = new THREE.SphereGeometry(0.16, 12, 12);
    const packetMat = new THREE.MeshBasicMaterial({
      color: 0x1D4ED8,
    });

    const packets: { mesh: THREE.Mesh; curveIndex: number; progress: number; speed: number }[] = [];

    for (let i = 0; i < packetCount; i++) {
      const pMesh = new THREE.Mesh(packetGeom, packetMat);
      rootGroup.add(pMesh);
      packets.push({
        mesh: pMesh,
        curveIndex: i % curvePaths.length,
        progress: (i / packetCount),
        speed: 0.003 + Math.random() * 0.003,
      });
    }

    // 4f. Ambient Civic Dust Particles
    const dustCount = 45;
    const dustGeom = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 18;
      dustPositions[i + 1] = Math.random() * 7 + 0.5;
      dustPositions[i + 2] = (Math.random() - 0.5) * 18;
    }

    dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x3B82F6,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
    });
    const dustPoints = new THREE.Points(dustGeom, dustMat);
    rootGroup.add(dustPoints);

    // 5. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive || prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      mouseX = (x / rect.width) * 2;
      mouseY = -(y / rect.height) * 2;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Parallax easing
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      if (!prefersReducedMotion) {
        // Slow rotation of city and hub
        rootGroup.rotation.y = elapsedTime * 0.05 + targetX * 0.2;
        hubCoreMesh.rotation.y = elapsedTime * 0.35;
        hubCoreMesh.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2;
        hubCageMesh.rotation.y = -elapsedTime * 0.2;
        hubCageMesh.rotation.z = Math.cos(elapsedTime * 0.4) * 0.15;

        // Pulsing rings
        const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.06;
        ring1.scale.set(pulse, pulse, 1);
        const pulse2 = 1 + Math.cos(elapsedTime * 2.0) * 0.05;
        ring2.scale.set(pulse2, pulse2, 1);

        // Animate packets flowing into hub
        packets.forEach((pkt) => {
          pkt.progress += pkt.speed;
          if (pkt.progress > 1) {
            pkt.progress = 0;
            pkt.curveIndex = (pkt.curveIndex + 1) % curvePaths.length;
          }
          const curve = curvePaths[pkt.curveIndex];
          const point = curve.getPoint(pkt.progress);
          pkt.mesh.position.copy(point);

          // Pulse scale near hub
          const scale = pkt.progress > 0.8 ? 1.0 + (1 - pkt.progress) * 1.5 : 1.0;
          pkt.mesh.scale.setScalar(scale);
        });

        // Dust drift
        dustPoints.rotation.y = elapsedTime * 0.02;

        // Camera gentle floating
        camera.position.x = 14 + targetX * 1.8;
        camera.position.y = 16 + targetY * 1.2 + Math.sin(elapsedTime * 0.5) * 0.3;
        camera.position.z = 16 - targetX * 1.2;
        camera.lookAt(0, 1.5, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      buildingMat.dispose();
      edgeMat.dispose();
      hubCoreMat.dispose();
      hubCageMat.dispose();
      ringMat.dispose();
      nodeMat.dispose();
      ringNodeMat.dispose();
      packetMat.dispose();
      dustMat.dispose();
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[380px] sm:min-h-[440px] lg:min-h-[520px] relative pointer-events-auto ${className}`}
      aria-label="Interactive 3D Civic Signal Network Visualization"
    />
  );
};

export default CivicWorkflowScene;
