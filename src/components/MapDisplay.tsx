
import { useRef, useEffect, useState } from "react";
import { ArrowDown, MapPin, Navigation } from "lucide-react";
import { Spinner } from "@/components/Spinner";

interface MapDisplayProps {
  location: { lat: number; lon: number } | null;
  amenities: any[];
}

const MapDisplay = ({ location, amenities }: MapDisplayProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Create a script element for OpenStreetMap (Leaflet)
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    document.head.appendChild(script);
    
    // Create a link element for Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);
  
  useEffect(() => {
    let map: any = null;
    let markers: any[] = [];
    
    const initializeMap = () => {
      if (!window.L || !mapContainerRef.current) return;
      
      // If map already exists, remove it and create a new one
      if (map) {
        map.remove();
      }
      
      // Default view if no location is provided
      const defaultLat = 37.7749;
      const defaultLon = -122.4194;
      
      // Create map
      map = window.L.map(mapContainerRef.current).setView(
        [location?.lat || defaultLat, location?.lon || defaultLon], 
        12
      );
      
      // Add OSM tile layer
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add markers for location and amenities
      if (location) {
        // Project location marker
        const locationMarker = window.L.marker([location.lat, location.lon], {
          icon: window.L.divIcon({
            className: "custom-div-icon",
            html: `<div class="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                   </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          })
        }).addTo(map);
        
        locationMarker.bindPopup("<b>Project Location</b>");
        markers.push(locationMarker);
        
        // Add amenity markers
        amenities.forEach(amenity => {
          const amenityMarker = window.L.marker([amenity.lat, amenity.lon], {
            icon: window.L.divIcon({
              className: "custom-div-icon",
              html: `<div class="bg-white text-accent-foreground rounded-full p-1 shadow-md">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></svg>
                     </div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
          }).addTo(map);
          
          amenityMarker.bindPopup(`<b>${amenity.name}</b><br>Distance: ${amenity.distance} km`);
          markers.push(amenityMarker);
        });
        
        // If we have amenities, create a bounds object to fit all markers
        if (amenities.length > 0) {
          const points = [
            [location.lat, location.lon],
            ...amenities.map(a => [a.lat, a.lon])
          ];
          const bounds = window.L.latLngBounds(points);
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
      
      setIsLoading(false);
    };
    
    // Check if Leaflet is loaded
    const leafletCheckInterval = setInterval(() => {
      if (window.L) {
        clearInterval(leafletCheckInterval);
        initializeMap();
      }
    }, 100);
    
    return () => {
      clearInterval(leafletCheckInterval);
      
      // Cleanup map
      if (map) {
        markers.forEach(marker => marker.remove());
        map.remove();
      }
    };
  }, [location, amenities]);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
          <Spinner size="lg" />
        </div>
      )}
      
      {!location && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center flex-col text-muted-foreground">
          <Navigation size={48} className="mb-4 opacity-50" />
          <p>Select a location to view the map</p>
        </div>
      )}
      
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-md overflow-hidden"
        style={{ display: isLoading && !location ? "none" : "block" }}
      />
      
      {amenities.length > 0 && (
        <div className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm p-3 rounded-md shadow-md text-xs">
          <h4 className="font-semibold mb-1">Nearby Amenities:</h4>
          <ul className="space-y-1">
            {[...new Set(amenities.map(a => a.type))].map(type => (
              <li key={type} className="flex items-center">
                <span className="w-4 h-4 bg-primary/20 rounded-full mr-2"></span>
                {type.replace('_', ' ')} ({amenities.filter(a => a.type === type).length})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Add global type definition for Leaflet
declare global {
  interface Window {
    L: any;
  }
}

export default MapDisplay;
