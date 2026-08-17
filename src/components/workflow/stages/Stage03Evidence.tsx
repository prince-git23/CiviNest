import React from 'react';
import { MapPin, Clock, CheckCircle2, ShieldCheck, Camera, Layers } from 'lucide-react';

export const Stage03Evidence: React.FC = () => {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        
        {/* Left: Spatial Layered Composition Visual */}
        <div className="lg:col-span-6 flex justify-start lg:justify-end order-2 lg:order-1">
          <div className="relative w-full max-w-md h-[340px] flex items-center justify-center">
            
            {/* Background Layer: Geospatial Map Canvas Card */}
            <div className="absolute top-2 left-6 right-2 bottom-6 bg-[#EBEFF5] rounded-2xl border border-[#D1D5DB] overflow-hidden shadow-xs">
              {/* Map Grid Pattern */}
              <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="map-grid" width="28" height="28" patternUnits="userSpaceOnUse">
                    <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#94A3B8" strokeWidth="0.75" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#map-grid)" />
              </svg>

              {/* Map Road Vectors */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                <path d="M0,80 Q100,70 200,120" fill="none" stroke="#CBD5E1" strokeWidth="12" />
                <path d="M70,0 Q80,100 130,200" fill="none" stroke="#CBD5E1" strokeWidth="8" />
                <circle cx="95" cy="85" r="18" fill="rgba(37, 99, 235, 0.15)" />
                <circle cx="95" cy="85" r="5" fill="#2563EB" />
              </svg>

              {/* Map Coordinates overlay */}
              <div className="absolute bottom-3 left-4 text-[10px] font-mono text-[#64748B] flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#2563EB]" />
                <span>Sector 14 • 40.7128° N, 74.0060° W</span>
              </div>
            </div>

            {/* Foreground Overlapping Smartphone Evidence Card */}
            <div className="absolute top-8 left-0 w-64 sm:w-72 bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_16px_36px_rgba(15,30,54,0.12)] p-3.5 z-20 transition-transform hover:-translate-y-1 duration-300">
              
              {/* Mock Photo Container */}
              <div className="relative rounded-xl overflow-hidden h-36 bg-[#0F1E36] mb-3 group">
                {/* Night Streetlight Scene Illustration */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0A1426] to-[#1E293B] flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Dark road */}
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-slate-950/80 border-t border-slate-700" />
                    {/* Street lamp pole */}
                    <div className="absolute left-16 bottom-10 w-1.5 h-20 bg-slate-400" />
                    <div className="absolute left-16 top-4 w-6 h-1.5 bg-slate-400" />
                    {/* Unlit bulb with caution glow */}
                    <div className="absolute left-21 top-5 w-3 h-3 rounded-full bg-amber-400/30 border border-amber-300 animate-pulse" />
                    
                    {/* Photo capture tag */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-200 font-mono">
                      <Camera className="w-2.5 h-2.5" />
                      <span>EXIF Match</span>
                    </div>

                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-200 font-mono">
                      <Clock className="w-2.5 h-2.5 text-blue-400" />
                      <span>18:42 EST</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo Evidence Details */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#4B5563] font-medium">Incident #8842-A</span>
                  {/* Verified Match Badge */}
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>Verified Match</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#6B7280]">
                  Cross-referenced with municipal GIS infrastructure inventory.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Stage 03 Copy */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <div className="max-w-md">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#2563EB] mb-3 block">
              EVIDENCE
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#0F1E36] tracking-tight mb-3">
              Spatial composition.
            </h3>
            <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed font-sans">
              Photographic proof, precise geospatial coordinates, and temporal data
              are automatically woven together to create an undeniable civic record.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Stage03Evidence;
