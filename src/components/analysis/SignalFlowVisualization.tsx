import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Activity, Layers, Network, RefreshCw } from 'lucide-react';

export type SignalFlowStage = 'RAW' | 'ANALYSIS' | 'CLUSTER';

interface SignalFlowVisualizationProps {
  initialStage?: SignalFlowStage;
  onStageChange?: (stage: SignalFlowStage) => void;
}

export const SignalFlowVisualization: React.FC<SignalFlowVisualizationProps> = ({
  initialStage = 'ANALYSIS',
  onStageChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStage, setActiveStage] = useState<SignalFlowStage>(initialStage);
  const [isHovered, setIsHovered] = useState(false);

  // References for Three.js animation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const stageTargetRef = useRef<SignalFlowStage>(initialStage);

  // Stage change handler
  const handleSelectStage = (stage: SignalFlowStage) => {
    setActiveStage(stage);
    stageTargetRef.current = stage;
    if (onStageChange) {
      onStageChange(stage);
    }
  };

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    let width = container.clientWidth || 300;
    let height = container.clientHeight || 200;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 6.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x3b82f6, 3, 20);
    pointLight1.position.set(3, 4, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x10b981, 2, 15);
    pointLight2.position.set(-3, -2, -2);
    scene.add(pointLight2);

    // 5. Build 3D Visual Elements

    // Main Group that rotates smoothly
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // A. Central Core (CiviNest AI Intelligence)
    const coreGeo = new THREE.IcosahedronGeometry(0.7, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x1e40af,
      emissiveIntensity: 0.6,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    worldGroup.add(coreMesh);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x60a5fa,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    worldGroup.add(innerMesh);

    // Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(1.3, 0.015, 16, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.6,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    ringMesh1.rotation.x = Math.PI / 3;
    worldGroup.add(ringMesh1);

    const ringGeo2 = new THREE.TorusGeometry(1.6, 0.012, 16, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.y = Math.PI / 4;
    worldGroup.add(ringMesh2);

    // B. Inflow Raw Signal Node
    const rawSignalGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const rawSignalMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
    });
    const rawSignalMesh = new THREE.Mesh(rawSignalGeo, rawSignalMat);
    rawSignalMesh.position.set(-2.8, 0.3, 0);
    worldGroup.add(rawSignalMesh);

    // Inflow connection line
    const inflowLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2.8, 0.3, 0),
      new THREE.Vector3(-1.2, 0.1, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const inflowLineMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.7,
    });
    const inflowLine = new THREE.Line(inflowLineGeo, inflowLineMat);
    worldGroup.add(inflowLine);

    // C. Surrounding Cluster Nodes (Sector 14 Context)
    const clusterNodes: THREE.Mesh[] = [];
    const clusterLines: THREE.Line[] = [];
    const clusterPositions = [
      new THREE.Vector3(2.2, 1.1, -0.8),
      new THREE.Vector3(2.4, -0.9, 0.7),
      new THREE.Vector3(1.1, -1.8, -1.2),
      new THREE.Vector3(0.5, 2.0, 1.0),
      new THREE.Vector3(2.6, 0.2, 1.4),
    ];

    clusterPositions.forEach((pos, idx) => {
      const nodeGeo = new THREE.SphereGeometry(0.12 + (idx % 2) * 0.04, 12, 12);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x10b981 : 0x3b82f6,
        emissive: idx % 2 === 0 ? 0x059669 : 0x2563eb,
        emissiveIntensity: 0.6,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      worldGroup.add(nodeMesh);
      clusterNodes.push(nodeMesh);

      // Connection to central core
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        pos,
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      worldGroup.add(line);
      clusterLines.push(line);
    });

    // D. Flowing Data Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 5;
      particlePositions[i + 1] = (Math.random() - 0.5) * 4;
      particlePositions[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    worldGroup.add(particles);

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // Mouse drag interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      worldGroup.rotation.y += deltaX * 0.008;
      worldGroup.rotation.x += deltaY * 0.008;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 6. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Idle rotations
      if (!isDragging) {
        worldGroup.rotation.y += 0.006;
      }
      coreMesh.rotation.x += 0.01;
      coreMesh.rotation.y += 0.012;
      ringMesh1.rotation.z += 0.015;
      ringMesh2.rotation.x += 0.012;

      // Pulse effects
      const pulse = Math.sin(elapsedTime * 3) * 0.08 + 1;
      innerMesh.scale.set(pulse, pulse, pulse);

      // Inflow signal motion
      const currentStage = stageTargetRef.current;
      if (currentStage === 'RAW') {
        const t = (Math.sin(elapsedTime * 2) + 1) / 2;
        rawSignalMesh.position.x = -2.8 + t * 1.5;
        rawSignalMesh.scale.set(1.4, 1.4, 1.4);
        clusterNodes.forEach((n) => n.scale.set(0.4, 0.4, 0.4));
      } else if (currentStage === 'ANALYSIS') {
        rawSignalMesh.position.set(-1.4, 0.2, 0);
        rawSignalMesh.scale.set(1.0, 1.0, 1.0);
        clusterNodes.forEach((n) => n.scale.set(0.8, 0.8, 0.8));
      } else if (currentStage === 'CLUSTER') {
        rawSignalMesh.position.set(0, 0, 0);
        rawSignalMesh.scale.set(0.8, 0.8, 0.8);
        clusterNodes.forEach((n, idx) => {
          const npulse = Math.sin(elapsedTime * 4 + idx) * 0.2 + 1.2;
          n.scale.set(npulse, npulse, npulse);
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserver.disconnect();
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      // Dispose Three.js resources
      coreGeo.dispose();
      coreMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      rawSignalGeo.dispose();
      rawSignalMat.dispose();
      inflowLineGeo.dispose();
      inflowLineMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-[#0A0F1D] rounded-3xl border border-[#1E293B] p-5 sm:p-6 shadow-xs text-left relative overflow-hidden flex flex-col justify-between min-h-[260px] sm:min-h-[290px]"
    >
      {/* Header & Stage Switcher */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
            Signal Flow
          </span>
        </div>

        {/* Stage Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 backdrop-blur-xs">
          {(['RAW', 'ANALYSIS', 'CLUSTER'] as SignalFlowStage[]).map((stage) => {
            const isSelected = activeStage === stage;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => handleSelectStage(stage)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {stage}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>

      {/* Bottom Neural Mapping Badge */}
      <div className="flex items-center justify-between z-10 pt-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono text-slate-300 backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-wider">NEURAL MAPPING</span>
        </div>

        <span className="text-[10px] text-slate-500 font-mono">
          Drag to rotate orbit
        </span>
      </div>
    </div>
  );
};
