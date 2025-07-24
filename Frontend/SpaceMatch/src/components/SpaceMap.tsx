import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

interface SpaceMapProps {
  address: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
  className?: string;
}

const SpaceMap: React.FC<SpaceMapProps> = ({
  address,
  street,
  houseNumber,
  postalCode,
  city,
  country,
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Initialize Google Maps API
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
        setError('Google Maps API key not configured');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        await loader.load();
        setIsGoogleLoaded(true);
        console.log('✅ Google Maps API loaded successfully for SpaceMap');
      } catch (error) {
        console.error('❌ Failed to load Google Maps:', error);
        setError('Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    initializeGoogleMaps();
  }, [GOOGLE_MAPS_API_KEY]);

  // Initialize map when Google is loaded
  useEffect(() => {
    if (!isGoogleLoaded || !mapRef.current) return;

    const initializeMap = async () => {
      try {
        const geocoder = new google.maps.Geocoder();
        const fullAddress = address || `${street} ${houseNumber}, ${postalCode} ${city}, ${country}`;
        
        // Geocode the address
        geocoder.geocode({ address: fullAddress }, (results, status) => {
          setIsLoading(false);
          
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            
            // Create map
            mapInstance.current = new google.maps.Map(mapRef.current!, {
              center: location,
              zoom: 16,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
              zoomControl: true,
              styles: [
                {
                  featureType: 'poi',
                  elementType: 'labels',
                  stylers: [{ visibility: 'on' }]
                }
              ]
            });

            // Add marker
            new google.maps.Marker({
              position: location,
              map: mapInstance.current,
              title: `${street} ${houseNumber}`,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
                    <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="#dc2626"/>
                    <circle cx="20" cy="20" r="8" fill="white"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 40),
                anchor: new google.maps.Point(16, 40)
              }
            });

            // Add info window
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="font-family: 'Inter', sans-serif; padding: 8px;">
                  <div style="font-weight: 600; margin-bottom: 4px;">${street} ${houseNumber}</div>
                  <div style="color: #6b7280; font-size: 14px;">${postalCode}${city ? ' ' + city : ''}</div>
                  <div style="color: #6b7280; font-size: 14px;">${country}</div>
                </div>
              `
            });

            // Add click listener to marker
            const marker = new google.maps.Marker({
              position: location,
              map: mapInstance.current,
              title: `${street} ${houseNumber}`
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstance.current, marker);
            });

          } else {
            setError('Unable to find location on map');
          }
        });

      } catch (err) {
        setError('Failed to initialize map');
        setIsLoading(false);
        console.error('Map initialization error:', err);
      }
    };

    initializeMap();
  }, [isGoogleLoaded, address, street, houseNumber, postalCode, city, country]);

  if (error) {
    return (
      <div className={`bg-gray-100 border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-100 border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="w-full h-full min-h-[200px]" 
        style={{ minHeight: '200px' }}
      />
      
      {/* Address overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-3">
        <div className="flex items-center">
          <svg className="w-4 h-4 text-red-700 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">
            <div className="font-medium text-gray-900">{street} {houseNumber}</div>
            <div className="text-gray-600">
              {postalCode} {city && `${city}, `}{country}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceMap;
