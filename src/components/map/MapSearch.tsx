import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import type { GeoPoint } from '../../services/geo/geoTypes';

interface SearchResult {
  name: string;
  address: string;
  point: GeoPoint;
  type: 'locality' | 'ward' | 'landmark' | 'address';
}

interface MapSearchProps {
  onSelectLocation?: (point: GeoPoint, name: string) => void;
  placeholder?: string;
  className?: string;
}

// Demo search results for Nagpur
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
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = demoSearchResults.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q)
    );
    setResults(filtered);
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
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((result, i) => (
            <button
              key={i}
              onClick={() => handleSelect(result)}
              className="w-full px-3 py-2.5 text-left hover:bg-[#F9FAFB] flex items-center gap-3 transition-colors border-b border-[#F3F4F6] last:border-0"
            >
              <span className="text-sm">{typeIcons[result.type]}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#111827] truncate">{result.name}</p>
                <p className="text-[11px] text-[#6B7280] truncate">{result.address}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapSearch;
