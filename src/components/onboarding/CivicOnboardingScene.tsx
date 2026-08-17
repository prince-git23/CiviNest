import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { CivicInterestId, OnboardingStepId } from '../../types';
import { CIVIC_INTERESTS, ONBOARDING_STEPS, StepConfig } from './onboardingData';

interface CivicOnboardingSceneProps {
  currentStep: OnboardingStepId;
  selectedInterests: CivicInterestId[];
  selectedWard?: string;
}

export const CivicOnboardingScene: React.FC<CivicOnboardingSceneProps> = ({
  currentStep,
  selectedInterests,
  selectedWard,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const cityGroupRef = useRef<THREE.Group | null>(null);
  const localityGroupRef = useRef<THREE.Group | null>(null);
  const communityGroupRef = useRef<THREE.Group | null>(null);
  const signalsGroupRef = useRef<THREE.Group | null>(null);
  const hubRingRef = useRef<THREE.Mesh | null>(null);
  const hubCoreRef = useRef<THREE.Mesh | null>(null);

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const cameraTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.4, 0));

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x11161f);
    scene.fog = new THREE.FogExp2(0x11161f, 0.024);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const initialConfig = ONBOARDING_STEPS[0];
    camera.position.set(...initialConfig.cameraPosition);
    camera.lookAt(...initialConfig.cameraTarget);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xdce7f5, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(20, 30, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.0);
    dirLight2.position.set(-20, -10, -15);
    scene.add(dirLight2);

    // 5. Ground Plane & Grid Lines
    const gridHelper = new THREE.GridHelper(44, 44, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // 6. City Group (Buildings & Streets)
    const cityGroup = new THREE.Group();
    cityGroupRef.current = cityGroup;
    scene.add(cityGroup);

    // Building materials
    const buildingMat = new THREE.MeshLambertMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.85,
    });
    const buildingEdgeMat = new THREE.LineBasicMaterial({
      color: 0x475569,
      transparent: true,
      opacity: 0.6,
    });

    // Generate low-poly city blocks
    const buildingGeom = new THREE.BoxGeometry(1, 1, 1);
    for (let x = -8; x <= 8; x += 2.2) {
      for (let z = -8; z <= 8; z += 2.2) {
        // Leave space for center hub
        if (Math.abs(x) < 2.5 && Math.abs(z) < 2.5) continue;

        const heightVal = 0.8 + Math.abs(Math.sin(x * 1.5 + z * 0.7)) * 3.2;
        const widthVal = 1.1 + (Math.sin(x) > 0 ? 0.3 : -0.2);
        const depthVal = 1.1 + (Math.cos(z) > 0 ? 0.3 : -0.2);

        const building = new THREE.Mesh(buildingGeom, buildingMat);
        building.scale.set(widthVal, heightVal, depthVal);
        building.position.set(x + (Math.sin(z) * 0.3), heightVal / 2, z + (Math.cos(x) * 0.3));
        cityGroup.add(building);

        // Edge wireframe for architectural look
        const edges = new THREE.EdgesGeometry(buildingGeom);
        const line = new THREE.LineSegments(edges, buildingEdgeMat);
        line.scale.set(widthVal, heightVal, depthVal);
        line.position.copy(building.position);
        cityGroup.add(line);
      }
    }

    // 7. Central Municipal Civic Intelligence Hub
    const hubGroup = new THREE.Group();
    hubGroup.position.set(0, 0, 0);

    const hubBaseGeom = new THREE.CylinderGeometry(2.0, 2.3, 0.4, 32);
    const hubBaseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.7,
      roughness: 0.2,
    });
    const hubBase = new THREE.Mesh(hubBaseGeom, hubBaseMat);
    hubBase.position.y = 0.2;
    hubGroup.add(hubBase);

    // Floating core
    const coreGeom = new THREE.OctahedronGeometry(0.7, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1,
    });
    const hubCore = new THREE.Mesh(coreGeom, coreMat);
    hubCore.position.y = 2.0;
    hubGroup.add(hubCore);
    hubCoreRef.current = hubCore;

    // Orbiting Rings
    const ringGeom = new THREE.TorusGeometry(1.6, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.85,
    });
    const hubRing = new THREE.Mesh(ringGeom, ringMat);
    hubRing.rotation.x = Math.PI / 2.5;
    hubRing.position.y = 2.0;
    hubGroup.add(hubRing);
    hubRingRef.current = hubRing;

    scene.add(hubGroup);

    // 8. Locality Sector Highlight Group (Step 2 Focus)
    const localityGroup = new THREE.Group();
    localityGroup.position.set(-4.2, 0, 3.8);

    // Locality zone boundary plane
    const zoneGeom = new THREE.RingGeometry(1.8, 2.2, 32);
    const zoneMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const zoneMesh = new THREE.Mesh(zoneGeom, zoneMat);
    zoneMesh.rotation.x = Math.PI / 2;
    zoneMesh.position.y = 0.02;
    localityGroup.add(zoneMesh);

    // Locality beacon pillar
    const beaconGeom = new THREE.CylinderGeometry(0.08, 0.08, 3.5, 16);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
    });
    const beacon = new THREE.Mesh(beaconGeom, beaconMat);
    beacon.position.y = 1.75;
    localityGroup.add(beacon);

    localityGroupRef.current = localityGroup;
    scene.add(localityGroup);

    // 9. Community Graph Group (Step 3 Focus)
    const communityGroup = new THREE.Group();
    communityGroup.position.set(-1.2, 0, 0.8);

    // Community Sub-nodes and interconnection lines
    const nodeCoords = [
      [-1.2, 1.2, -0.6],
      [1.4, 0.8, -1.0],
      [-0.8, 1.5, 1.2],
      [0.9, 1.1, 1.0],
      [0.0, 1.8, 0.0],
    ];

    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.9,
    });
    const nodeGeom = new THREE.SphereGeometry(0.2, 16, 16);

    const linePoints: THREE.Vector3[] = [];
    nodeCoords.forEach(([nx, ny, nz]) => {
      const node = new THREE.Mesh(nodeGeom, nodeMat);
      node.position.set(nx, ny, nz);
      communityGroup.add(node);
      linePoints.push(new THREE.Vector3(nx, ny, nz));
    });

    // Interconnect nodes
    const communityLineMat = new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.7,
    });
    for (let i = 0; i < linePoints.length; i++) {
      for (let j = i + 1; j < linePoints.length; j++) {
        const lineGeom = new THREE.BufferGeometry().setFromPoints([linePoints[i], linePoints[j]]);
        const line = new THREE.Line(lineGeom, communityLineMat);
        communityGroup.add(line);
      }
    }

    communityGroupRef.current = communityGroup;
    scene.add(communityGroup);

    // 10. Signals Group (Step 4 Focus)
    const signalsGroup = new THREE.Group();
    signalsGroupRef.current = signalsGroup;
    scene.add(signalsGroup);

    // Initial signal particles creation
    createSignalParticles(signalsGroup, selectedInterests);

    // 11. Mouse Movement Handler for parallax
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 0.8;
      mouseRef.current.targetY = y * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 12. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    });
    resizeObserver.observe(containerRef.current);

    // 13. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Animate central hub core & rings
      if (hubCoreRef.current) {
        hubCoreRef.current.rotation.y = elapsedTime * 0.6;
        hubCoreRef.current.rotation.x = Math.sin(elapsedTime * 0.8) * 0.2;
        hubCoreRef.current.position.y = 2.0 + Math.sin(elapsedTime * 1.5) * 0.15;
      }
      if (hubRingRef.current) {
        hubRingRef.current.rotation.z = elapsedTime * 0.8;
      }

      // Animate community nodes
      if (communityGroupRef.current) {
        communityGroupRef.current.rotation.y = Math.sin(elapsedTime * 0.4) * 0.1;
      }

      // Animate signals
      if (signalsGroupRef.current) {
        signalsGroupRef.current.children.forEach((child, i) => {
          if (child instanceof THREE.Mesh) {
            child.position.y += Math.sin(elapsedTime * 2 + i) * 0.004;
          }
        });
      }

      // Render with slight mouse parallax
      if (cameraRef.current && rendererRef.current && sceneRef.current) {
        cameraRef.current.lookAt(cameraTargetRef.current);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();
      buildingGeom.dispose();
      buildingMat.dispose();
      buildingEdgeMat.dispose();
    };
  }, []);

  // Helper to generate dynamic signal particles matching user interests
  const createSignalParticles = (group: THREE.Group, interests: CivicInterestId[]) => {
    // Clear old signals
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    }

    const interestItems = CIVIC_INTERESTS.filter((i) => interests.includes(i.id));
    const activeColors = interestItems.length > 0
      ? interestItems.map((i) => i.hexColor)
      : [0x38bdf8, 0x2563eb, 0x10b981];

    const particleGeom = new THREE.SphereGeometry(0.18, 12, 12);

    for (let i = 0; i < 28; i++) {
      const color = activeColors[i % activeColors.length];
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.9,
        roughness: 0.2,
      });

      const particle = new THREE.Mesh(particleGeom, mat);
      const angle = (i / 28) * Math.PI * 2 + (i % 3);
      const radius = 2.5 + (i % 6) * 1.1;
      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;
      const py = 0.5 + ((i * 13) % 17) * 0.18;

      particle.position.set(px, py, pz);
      group.add(particle);
    }
  };

  // Re-generate signal particles when interests update
  useEffect(() => {
    if (signalsGroupRef.current) {
      createSignalParticles(signalsGroupRef.current, selectedInterests);
    }
  }, [selectedInterests]);

  // GSAP Camera & Scene Transition when currentStep changes
  useEffect(() => {
    if (!cameraRef.current) return;

    const stepIndex = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep);
    const targetConfig = ONBOARDING_STEPS[stepIndex] || ONBOARDING_STEPS[0];

    // Animate camera position
    gsap.to(cameraRef.current.position, {
      x: targetConfig.cameraPosition[0],
      y: targetConfig.cameraPosition[1],
      z: targetConfig.cameraPosition[2],
      duration: 1.4,
      ease: 'power3.inOut',
    });

    // Animate camera target
    gsap.to(cameraTargetRef.current, {
      x: targetConfig.cameraTarget[0],
      y: targetConfig.cameraTarget[1],
      z: targetConfig.cameraTarget[2],
      duration: 1.4,
      ease: 'power3.inOut',
    });

    // Highlighting groups depending on current step
    if (localityGroupRef.current) {
      gsap.to(localityGroupRef.current.scale, {
        x: currentStep === 'location' ? 1.2 : 1.0,
        y: currentStep === 'location' ? 1.2 : 1.0,
        z: currentStep === 'location' ? 1.2 : 1.0,
        duration: 0.8,
        ease: 'back.out(1.5)',
      });
    }

    if (communityGroupRef.current) {
      gsap.to(communityGroupRef.current.scale, {
        x: currentStep === 'community' ? 1.3 : 1.0,
        y: currentStep === 'community' ? 1.3 : 1.0,
        z: currentStep === 'community' ? 1.3 : 1.0,
        duration: 0.8,
        ease: 'back.out(1.5)',
      });
    }

    if (signalsGroupRef.current) {
      gsap.to(signalsGroupRef.current.scale, {
        x: currentStep === 'interests' ? 1.25 : 1.0,
        y: currentStep === 'interests' ? 1.25 : 1.0,
        z: currentStep === 'interests' ? 1.25 : 1.0,
        duration: 0.8,
        ease: 'back.out(1.5)',
      });
    }
  }, [currentStep]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#11161f]">
      {/* Three.js WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />

      {/* Subtle Coordinate Grid Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(17,22,31,0.6)_100%)]" />

      {/* Grid Pattern Dots */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
};

export default CivicOnboardingScene;
