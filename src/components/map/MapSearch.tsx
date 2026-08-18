import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Loader2, AlertCircle } from 'lucide-react';
import type { GeoPoint } from '../../services/geo/geoTypes';
import { searchPlaces, PlaceSearchResult } from '../../services/geo/geocodingService';

type SearchResult = PlaceSearchResult;

interface MapSearchProps {
  onSelectLocation?: (point: GeoPoint, name: string) => void;
  placeholder?: string;
  className?: string;
}

// Fallback demo results used only when the geocoder is unreachable (offline /
// blocked network). Real searches go through the Photon geocoding API.
const demoSearchResults: SearchResult[] = [
  { name: 'Dharampeth', address: 'Dharampeth, Nagpur', point: { latitude: 21.1458, longitude: 79.0882 }, type: 'locality' },
  { name: 'Ward 14', address: 'Ward 14, Dharampeth, Nagpur', point: { latitude: 21.1462, longitude: 79.0874 }, type: 'ward' },
  { name: 'Ward 08', address: 'Ward 08, Downtown, Nagpur', point: { latitude: 21.1441, longitude: 79.0862 }, type: 'ward' },
  { name: 'Ward 12', address: 'Ward 12, East Zone, Nagpur', point: { latitude: 21.1490, longitude: 79.0890 }, type: 'ward' },
  { name: 'Metro Hospital', address: 'Metro Hospital, Nagpur', point: { latitude: 21.1441, longitude: 79.0862 }, type: 'landmark' },
  { name: 'Dharampeth High School', address: 'Dharampeth, Nagpur', point: { latitude: 21.1455, longitude: 79.0888 }, type: 'landmark' },
  { name: 'Central Market', address: 'Central Market, Ward 08, Nagpur', point: { latitude: 21.1432, longitude: 79.0855 }, type: 'landmark' },
  { name: 'Children\'s Park', address: 'Ward 12, Nagpur', point: { latitude: 21.1480, longitude: 79.0890 }, type: 'landmark' },
  { name: 'Nagpur Railway Station', address: 'Itwari, Nagpur', point: { latitude: 21.1510, longitude: 79.0830 }, type: 'landmark' },
  { name: 'Sitabuldi', address: 'Sitabuldi, Nagpur', point: { latitude: 21.1440, longitude: 79.0820 }, type: 'locality' },
];

export const MapSearch: React.FC<MapSearchProps> = ({
  onSelectLocation,
  placeholder = 'Search locality, ward or landmark...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      setUsingFallback(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setUsingFallback(false);
      try {
        const found = await searchPlaces(q, controller.signal);
        if (controller.signal.aborted) return;
        if (found.length > 0) {
          setResults(found);
        } else {
          // No geocoder hits — fall back to the local reference list
          const lower = q.toLowerCase();
          setResults(
            demoSearchResults.filter(
              (r) => r.name.toLowerCase().includes(lower) || r.address.toLowerCase().includes(lower)
            )
          );
          setUsingFallback(true);
        }
      } catch (err: any) {
        if (controller.signal.aborted) return;
        // Geocoder unreachable — use the local reference list so search
        // still works offline.
        const lower = q.toLowerCase();
        setResults(
          demoSearchResults.filter(
            (r) => r.name.toLowerCase().includes(lower) || r.address.toLowerCase().includes(lower)
          )
        );
        setUsingFallback(true);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    onSelectLocation?.(result.point, result.name);
    setQuery(result.name);
    setIsOpen(false);
  };

  const typeIcons: Record<string, string> = {
    locality: '🏘️',
    ward: '🏛️',
    landmark: '📍',
    address: '📌',
  };

  const showResults = isOpen && query.trim().length >= 2;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#94A3B8] focus:ring-2 focus:ring-[#0F1E36]/10 transition-all"
        />
        {query ? (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {showResults && (
        <div className="absolute top-full mt-1 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto">
          {searching ? (
            <div className="px-4 py-4 flex items-center justify-center gap-2 text-xs text-[#6B7280]">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              Searching places...
            </div>
          ) : results.length > 0 ? (
            <>
              {usingFallback && (
                <div className="px-3 py-2 flex items-start gap-1.5 text-[10.5px] text-amber-700 bg-amber-50 border-b border-amber-100">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Online geocoder unreachable — showing nearby reference places.</span>
                </div>
              )}
              {results.map((result, i) => (
                <button
                  key={`${result.name}-${i}`}
                  onClick={() => handleSelect(result)}
                  className="w-full px-3 py-2.5 text-left hover:bg-[#F9FAFB] flex items-center gap-3 transition-colors border-b border-[#F3F4F6] last:border-0 cursor-pointer"
                >
                  <span className="text-sm">{typeIcons[result.type]}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncate">{result.name}</p>
                    <p className="text-[11px] text-[#6B7280] truncate">{result.address}</p>
                  </div>
                  <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0 ml-auto" />
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-4 text-center text-xs text-[#6B7280]">
              No places found for “{query}”.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapSearch;
