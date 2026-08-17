/// <reference types="@react-three/fiber" />
import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Crosshair,
  Mountain,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { spatialLayers, wards, departments, type SpatialLayer } from '../../data/municipalMockData';

// Three.js dynamic import to avoid SSR issues
let Canvas: any = null;
let OrbitControls: any = null;

const loadThree = async () => {
  try {
    const fiber = await import('@react-three/fiber' as any);
    const drei = await import('@react-three/drei' as any);
    Canvas = fiber.Canvas;
    OrbitControls = drei.OrbitControls;
  } catch {
    // Three.js fiber/drei not available, fall back to 2D representation
  }
};

// ── 3D Map Scene ──
const CityBlock: React.FC<{
  position: [number, number, number];
  height: number;
  color: string;
  label?: string;
}> = ({ position, height, color }) => {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[0.8, height, 0.8]} />
      <meshStandardMaterial color={color} transparent opacity={0.85} />
    </mesh>
  );
};

const IssueMarker: React.FC<{
  position: [number, number, number];
  color: string;
  scale?: number;
}> = ({ position, color, scale = 1 }) => {
  const meshRef = useRef<any>(null);

  useEffect(() => {
    if (!meshRef.current) return;
    let t = 0;
    const animate = () => {
      t += 0.02;
      if (meshRef.current) {
        meshRef.current.position.y = position[1] + Math.sin(t) * 0.05;
      }
      requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [position]);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.15 * scale, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  );
};

const MapScene: React.FC = () => {
  const blocks = [
    { pos: [-2, 0.5, -1] as [number, number, number], h: 1, c: '#94A3B8' },
    { pos: [-1, 0.75, -1] as [number, number, number], h: 1.5, c: '#94A3B8' },
    { pos: [0, 0.4, -1] as [number, number, number], h: 0.8, c: '#94A3B8' },
    { pos: [1, 0.6, -1] as [number, number, number], h: 1.2, c: '#94A3B8' },
    { pos: [2, 0.3, -1] as [number, number, number], h: 0.6, c: '#94A3B8' },
    { pos: [-2, 0.35, 0] as [number, number, number], h: 0.7, c: '#CBD5E1' },
    { pos: [-1, 0.9, 0] as [number, number, number], h: 1.8, c: '#CBD5E1' },
    { pos: [0, 0.5, 0] as [number, number, number], h: 1, c: '#CBD5E1' },
    { pos: [1, 0.4, 0] as [number, number, number], h: 0.8, c: '#CBD5E1' },
    { pos: [2, 0.55, 0] as [number, number, number], h: 1.1, c: '#CBD5E1' },
    { pos: [-2, 0.45, 1] as [number, number, number], h: 0.9, c: '#E2E8F0' },
    { pos: [-1, 0.6, 1] as [number, number, number], h: 1.2, c: '#E2E8F0' },
    { pos: [0, 0.7, 1] as [number, number, number], h: 1.4, c: '#E2E8F0' },
    { pos: [1, 0.35, 1] as [number, number, number], h: 0.7, c: '#E2E8F0' },
    { pos: [2, 0.4, 1] as [number, number, number], h: 0.8, c: '#E2E8F0' },
  ];

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
      <pointLight position={[-3, 4, 2]} intensity={0.3} color="#60A5FA" />

      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#F1F5F9" />
      </mesh>

      {/* Road Grid */}
      {[-2, 0, 2].map((x) => (
        <mesh key={`road-h-${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, 0]}>
          <planeGeometry args={[0.15, 6]} />
          <meshStandardMaterial color="#64748B" />
        </mesh>
      ))}
      {[-1, 1].map((z) => (
        <mesh key={`road-v-${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[6, 0.15]} />
          <meshStandardMaterial color="#64748B" />
        </mesh>
      ))}

      {/* Buildings */}
      {blocks.map((b, i) => (
        <CityBlock key={i} position={b.pos} height={b.h} color={b.c} />
      ))}

      {/* Issue Markers */}
      <IssueMarker position={[-1.5, 1.2, 0.5]} color="#EF4444" scale={1.5} />
      <IssueMarker position={[0.5, 0.8, -0.5]} color="#F97316" scale={1.2} />
      <IssueMarker position={[1.5, 1, 0.8]} color="#EF4444" scale={1.3} />
      <IssueMarker position={[-0.5, 0.6, 1.5]} color="#3B82F6" scale={1} />
      <IssueMarker position={[0, 0.9, 0]} color="#EF4444" scale={1.8} />
    </>
  );
};

interface SpatialIntelligenceProps {
  onSelectPage?: (page: string) => void;
}

export const SpatialIntelligence: React.FC<SpatialIntelligenceProps> = ({ onSelectPage }) => {
  const [layers, setLayers] = useState<SpatialLayer[]>(spatialLayers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState<string | null>('W-14');
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [ThreeCanvas, setThreeCanvas] = useState<any>(null);

  useEffect(() => {
    loadThree().then(() => {
      setThreeLoaded(true);
      setThreeCanvas(() => Canvas);
    });
  }, []);

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l))
    );
  };

  const selectedWardData = wards.find((w) => w.id === selectedWard);
  const adjacentWards = wards.filter((w) => w.id !== selectedWard).slice(0, 3);

  const topCategories = [
    { name: 'Water Supply', count: 18 },
    { name: 'Road Maintenance', count: 12 },
    { name: 'Sanitation', count: 7 },
  ];
  const maxCatCount = Math.max(...topCategories.map((c) => c.count));

  return (
    <div className="space-y-4">
      {/* ── Search Bar ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-3">
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-[#9CA3AF] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locations, assets, IDs..."
            className="flex-1 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none bg-transparent"
          />
          <button className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Left Panel: Layers ── */}
        <div className="space-y-4">
          {/* Active Layers */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
                Active Layers
              </h3>
              <button className="text-xs font-semibold text-[#2563EB] hover:underline">
                Edit
              </button>
            </div>

            <div className="space-y-3">
              {layers.map((layer) => (
                <div key={layer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleLayer(layer.id)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        layer.active ? 'bg-[#1E293B]' : 'bg-[#D1D5DB]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full shadow transition-transform ${
                          layer.active ? 'translate-x-5 bg-white' : 'bg-white'
                        }`}
                      />
                    </button>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="text-sm text-[#374151]">{layer.name}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Map Controls */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center justify-center gap-6">
            <button className="flex flex-col items-center gap-1 text-[#6B7280] hover:text-[#111827] transition-colors">
              <Crosshair className="w-5 h-5" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Recenter</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-[#6B7280] hover:text-[#111827] transition-colors">
              <Mountain className="w-5 h-5" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Topography</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-[#6B7280] hover:text-[#111827] transition-colors">
              <Clock className="w-5 h-5" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">Timeline</span>
            </button>
          </div>
        </div>

        {/* ── Center: 3D Map ── */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden min-h-[500px]">
          {threeLoaded && ThreeCanvas ? (
            <div className="w-full h-full min-h-[500px]">
              <ThreeCanvas
                shadows
                camera={{ position: [5, 5, 5], fov: 45 }}
                style={{ background: '#F8FAFC' }}
              >
                <MapScene />
                {OrbitControls && <OrbitControls enablePan enableZoom enableRotate />}
              </ThreeCanvas>
            </div>
          ) : (
            <div className="w-full h-full min-h-[500px] bg-[#1A2332] flex items-center justify-center">
              <p className="text-sm text-slate-400">Loading 3D Map...</p>
            </div>
          )}
        </div>

        {/* ── Right Panel: Ward Analysis ── */}
        <div className="space-y-4">
          {selectedWardData && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#111827]">
                    {selectedWardData.name} Analysis
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">Nagpur Central District</p>
                </div>
                <button className="p-1 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Active Issues + Critical Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F9FAFB] rounded-xl p-4">
                    <p className="text-xs text-[#6B7280] mb-1">Active Issues</p>
                    <p className="text-3xl font-bold text-[#111827]">
                      {selectedWardData.activeIssues}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-[11px] text-emerald-600 font-medium">
                        +12% vs last week
                      </span>
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="text-xs text-red-600 mb-1 font-medium">Critical Priority</p>
                    <p className="text-3xl font-bold text-red-700">
                      {selectedWardData.criticalIssues}
                    </p>
                    <p className="text-[11px] text-red-600 mt-1 font-medium">
                      ! Require immediate action
                    </p>
                  </div>
                </div>

                {/* SLA Risk */}
                <div className="bg-[#F9FAFB] rounded-xl p-4">
                  <p className="text-xs text-[#6B7280] mb-1">SLA Risk</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-[#111827]">
                      {selectedWardData.overSla}
                    </p>
                    <span className="text-sm text-[#6B7280]">tickets</span>
                  </div>
                  {/* Mini sparkline */}
                  <div className="mt-2 h-8 flex items-end gap-1">
                    {[3, 5, 4, 7, 5, 8, 6].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-blue-200 rounded-t"
                        style={{ height: `${h * 10}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Top Categories */}
                <div>
                  <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3">
                    Top Categories
                  </p>
                  <div className="space-y-3">
                    {topCategories.map((cat) => (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-[#374151]">{cat.name}</span>
                          <span className="text-sm font-semibold text-[#111827]">
                            {cat.count}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1E293B] rounded-full"
                            style={{ width: `${(cat.count / maxCatCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Generate AI Brief Button */}
                <button className="w-full py-2.5 bg-[#1E293B] text-white text-sm font-semibold rounded-lg hover:bg-[#0F172A] transition-colors">
                  Generate AI Brief for {selectedWardData.name}
                </button>
              </div>
            </div>
          )}

          {/* Adjacent Ward Load */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#111827]">Adjacent Ward Load</h3>
            </div>
            <div className="divide-y divide-[#F3F4F6]">
              {selectedWardData && (
                <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-[#F9FAFB] text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">
                  <div className="col-span-2">Ward</div>
                  <div className="text-right">Active</div>
                  <div className="text-right">Critical</div>
                </div>
              )}
              {selectedWardData && (
                <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-blue-50/50 items-center">
                  <div className="col-span-2 text-sm font-semibold text-[#111827]">
                    {selectedWardData.id} ({selectedWardData.name})
                  </div>
                  <div className="text-right text-sm text-[#374151]">
                    {selectedWardData.activeIssues}
                  </div>
                  <div className="text-right text-sm font-semibold text-red-600">
                    {selectedWardData.criticalIssues}
                  </div>
                </div>
              )}
              {adjacentWards.map((ward) => (
                <div
                  key={ward.id}
                  className="grid grid-cols-4 gap-4 px-5 py-3 items-center hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                  onClick={() => setSelectedWard(ward.id)}
                >
                  <div className="col-span-2 text-sm text-[#374151]">
                    {ward.id} ({ward.name})
                  </div>
                  <div className="text-right text-sm text-[#374151]">{ward.activeIssues}</div>
                  <div
                    className={`text-right text-sm font-semibold ${
                      ward.criticalIssues > 5 ? 'text-red-600' : 'text-[#374151]'
                    }`}
                  >
                    {ward.criticalIssues}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpatialIntelligence;
