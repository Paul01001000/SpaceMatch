import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import SimpleNotification from './SimpleNotification';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

export interface LocationDetails {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationDetails) => void;
  initialValue?: string;
  initialLocation?: LocationDetails;
  error?: string;
  className?: string;
  placeholder?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialValue = '',
  initialLocation,
  error,
  className = '',
  placeholder = 'Enter address or click on map...'
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationDetails | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
        console.error('Google Maps API key not found in environment variables');
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
        setIsLoading(false);
        
        console.log('✅ Google Maps API loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load Google Maps:', error);
        setIsLoading(false);
      }
    };

    initializeGoogleMaps();
  }, [GOOGLE_MAPS_API_KEY]);

  // Update input value when initialValue prop changes (for editing existing spaces)
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // Set initial location if provided (for editing existing spaces)
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation(initialLocation);
      setInputValue(initialLocation.formattedAddress);
    }
  }, [initialLocation]);

  // Handle clicks outside the suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  useEffect(() => {
    if (isGoogleLoaded && inputRef.current) {
      // Initialize autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { 
          country: ['de', 'at', 'ch', 'nl', 'be', 'fr', 'it', 'es', 'pt', 'gb', 'us', 'ca'] 
        },
        fields: ['address_components', 'formatted_address', 'geometry', 'name']
      });

      // Add place changed listener
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.address_components) {
          const locationDetails = parseGoogleAddressComponents(place);
          handleLocationSelect(locationDetails);
        }
      });
    }
  }, [isGoogleLoaded]);

  const initializeMap = () => {
    if (!isGoogleLoaded || !mapRef.current) return;

    // Default to Berlin if no location is selected
    const defaultLocation = { lat: 52.5200, lng: 13.4050 };
    const center = selectedLocation 
      ? { lat: selectedLocation.latitude || defaultLocation.lat, lng: selectedLocation.longitude || defaultLocation.lng }
      : defaultLocation;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: selectedLocation ? 15 : 10,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Add click listener to map
    mapInstance.current.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        handleMapClick(event.latLng);
      }
    });

    // Add existing marker if location is selected
    if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
      addMarker({ lat: selectedLocation.latitude, lng: selectedLocation.longitude });
    }
  };

  const handleMapClick = async (latLng: google.maps.LatLng) => {
    if (!isGoogleLoaded) return;

    setIsLoading(true);
    
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: latLng });
      
      if (response.results[0]) {
        const place = response.results[0];
        const locationDetails = parseGoogleAddressComponents(place);
        locationDetails.latitude = latLng.lat();
        locationDetails.longitude = latLng.lng();
        
        handleLocationSelect(locationDetails);
        addMarker(latLng);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMarker = (position: google.maps.LatLng | google.maps.LatLngLiteral) => {
    if (!mapInstance.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    // Add new marker
    markerRef.current = new google.maps.Marker({
      position,
      map: mapInstance.current,
      draggable: true,
      title: 'Selected Location'
    });

    // Add drag listener
    markerRef.current.addListener('dragend', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        handleMapClick(event.latLng);
      }
    });

    // Center map on marker
    mapInstance.current.setCenter(position);
  };

  const parseGoogleAddressComponents = (place: google.maps.places.PlaceResult | google.maps.GeocoderResult): LocationDetails => {
    let street = '', houseNumber = '', city = '', postalCode = '', country = '';
    let latitude: number | undefined, longitude: number | undefined;

    if (place.address_components) {
      place.address_components.forEach((component) => {
        const types = component.types;
        
        if (types.includes('street_number')) {
          houseNumber = component.long_name;
        }
        if (types.includes('route')) {
          street = component.long_name;
        }
        if (types.includes('locality')) {
          city = component.long_name;
        }
        if (types.includes('postal_code')) {
          postalCode = component.long_name;
        }
        if (types.includes('country')) {
          country = component.long_name;
        }
      });

      // Fallbacks for missing components
      if (!city) {
        place.address_components.forEach((component) => {
          if (component.types.includes('administrative_area_level_2')) {
            city = component.long_name;
          } else if (!city && component.types.includes('administrative_area_level_1')) {
            city = component.long_name;
          }
        });
      }
    }

    // Extract coordinates if available
    if (place.geometry?.location) {
      if (typeof place.geometry.location.lat === 'function') {
        latitude = place.geometry.location.lat();
        longitude = place.geometry.location.lng();
      } else {
        latitude = (place.geometry.location as any).lat;
        longitude = (place.geometry.location as any).lng;
      }
    }

    return {
      street: street || 'Unknown Street',
      houseNumber: houseNumber || '1',
      city: city || 'Unknown City',
      postalCode: postalCode || '00000',
      country: country || 'Unknown Country',
      formattedAddress: place.formatted_address || 'Unknown Address',
      latitude,
      longitude
    };
  };

  const handleLocationSelect = (location: LocationDetails) => {
    setSelectedLocation(location);
    setInputValue(location.formattedAddress);
    setShowSuggestions(false);
    onLocationSelect(location);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // If input is too short, clear suggestions immediately
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Set new timer for debounced search
    const newTimer = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // 300ms delay

    setDebounceTimer(newTimer);
  };

  const fetchSuggestions = async (value: string) => {
    if (!isGoogleLoaded) return;

    setIsLoading(true);
    
    try {
      const service = new google.maps.places.AutocompleteService();
      const request = {
        input: value,
        componentRestrictions: { 
          country: ['de', 'at', 'ch', 'nl', 'be', 'fr', 'it', 'es', 'pt', 'gb', 'us', 'ca'] 
        }
      };

      const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve) => {
        service.getPlacePredictions(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results);
          } else {
            resolve([]);
          }
        });
      });

      setSuggestions(predictions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = useCallback(async (suggestion: google.maps.places.AutocompletePrediction) => {
    if (!isGoogleLoaded) return;

    setIsLoading(true);
    
    try {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      const place = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        service.getDetails({
          placeId: suggestion.place_id,
          fields: ['address_components', 'formatted_address', 'geometry', 'name']
        }, (result, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            resolve(result);
          } else {
            reject(status);
          }
        });
      });

      const locationDetails = parseGoogleAddressComponents(place);
      handleLocationSelect(locationDetails);
    } catch (error) {
      console.error('Place details error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isGoogleLoaded]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setNotification({
        message: 'Geolocation is not supported by this browser.',
        type: 'error'
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Got coordinates:', { latitude, longitude });
        
        try {
          if (!isGoogleLoaded) {
            setNotification({
              message: 'Google Maps is still loading. Please try again in a moment.',
              type: 'info'
            });
            setIsGettingLocation(false);
            return;
          }

          // Reverse geocode the coordinates to get address
          const geocoder = new google.maps.Geocoder();
          console.log('🔍 Starting reverse geocoding...');
          
          const response = await geocoder.geocode({ 
            location: { lat: latitude, lng: longitude } 
          });
          
          console.log('📍 Geocoding response:', response);
          
          if (response.results && response.results.length > 0) {
            const place = response.results[0];
            console.log('🏠 Selected place:', place);
            
            const locationDetails = parseGoogleAddressComponents(place);
            locationDetails.latitude = latitude;
            locationDetails.longitude = longitude;
            
            console.log('✅ Parsed location details:', locationDetails);
            
            handleLocationSelect(locationDetails);
            
            // If map is open, add marker and center
            if (showMap && mapInstance.current) {
              addMarker({ lat: latitude, lng: longitude });
            }
          } else {
            console.error('❌ No results from geocoding');
            // Fallback: Create a basic location with coordinates
            const fallbackLocation: LocationDetails = {
              street: 'Current Location',
              houseNumber: '',
              city: 'Unknown City',
              postalCode: '',
              country: 'Unknown Country',
              formattedAddress: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
              latitude,
              longitude
            };
            
            console.log('📍 Using fallback location:', fallbackLocation);
            handleLocationSelect(fallbackLocation);
            
            // If map is open, add marker and center
            if (showMap && mapInstance.current) {
              addMarker({ lat: latitude, lng: longitude });
            }
            
            setNotification({
              message: 'Location detected but address details unavailable. Coordinates have been saved.',
              type: 'info'
            });
          }
        } catch (error) {
          console.error('❌ Reverse geocoding error:', error);
          
          // Fallback: Create a basic location with coordinates even if geocoding fails
          const fallbackLocation: LocationDetails = {
            street: 'Current Location',
            houseNumber: '',
            city: 'Unknown City',
            postalCode: '',
            country: 'Unknown Country',
            formattedAddress: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            latitude,
            longitude
          };
          
          console.log('📍 Using fallback location after error:', fallbackLocation);
          handleLocationSelect(fallbackLocation);
          
          // If map is open, add marker and center
          if (showMap && mapInstance.current) {
            addMarker({ lat: latitude, lng: longitude });
          }
          
          setNotification({
            message: 'Location detected but address lookup failed. Coordinates have been saved. You can refine the address manually.',
            type: 'info'
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        console.error('❌ Geolocation error:', error);
        
        let errorMessage = 'Unable to retrieve your location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied. Please enable location services and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        
        setNotification({
          message: errorMessage,
          type: 'error'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 60000 // Reduced cache time to 1 minute
      }
    );
  }, [isGoogleLoaded, showMap, handleLocationSelect]);

  const suggestionItems = useMemo(() => {
    return suggestions.map((suggestion) => (
      <div
        key={suggestion.place_id}
        onMouseDown={(e) => {
          e.preventDefault(); // Prevent input from losing focus
          handleSuggestionClick(suggestion);
        }}
        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
      >
        <div className="flex items-start">
          <span className="text-gray-400 mr-3 mt-1">📍</span>
          <div>
            <div className="font-medium text-gray-900">
              {suggestion.structured_formatting?.main_text || suggestion.description}
            </div>
            {suggestion.structured_formatting?.secondary_text && (
              <div className="text-sm text-gray-500">
                {suggestion.structured_formatting.secondary_text}
              </div>
            )}
          </div>
        </div>
      </div>
    ));
  }, [suggestions, handleSuggestionClick]);

  const toggleMap = () => {
    setShowMap(!showMap);
    if (!showMap) {
      // Initialize map when showing it
      setTimeout(() => initializeMap(), 100);
    }
  };

  return (
    <div className="space-y-4">
      {/* Input Field */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location *
          <span className="text-gray-500 text-xs ml-2">
            (Type an address, use current location, or click on map)
          </span>
        </label>
        
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className={`w-full p-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${className}`}
            disabled={isLoading}
          />
          
          {/* Current Location Button */}
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isGettingLocation || !isGoogleLoaded}
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
              isGettingLocation || !isGoogleLoaded
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
            title="Use current location"
          >
            {isGettingLocation ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
            ) : (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          {(isLoading && !isGettingLocation) && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-700"></div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestionItems}
          </div>
        )}
      </div>

      {/* Map Toggle Button */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={toggleMap}
          disabled={!isGoogleLoaded}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            isGoogleLoaded
              ? 'bg-red-700 hover:bg-red-800 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {showMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
        </button>
        
        {!isGoogleLoaded && (
          <span className="text-sm text-gray-500">Loading Google Maps...</span>
        )}
      </div>

      {/* Map Container */}
      {showMap && isGoogleLoaded && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div
            ref={mapRef}
            className="w-full h-96"
            style={{ minHeight: '400px' }}
          />
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Click on the map to select a location or drag the marker to adjust the position.
            </p>
          </div>
        </div>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="p-4 bg-stone-50 border-2 border-red-700 rounded-lg">
          <h4 className="font-medium text-red-900 mb-2">Selected Location:</h4>
          <p className="text-red-800 font-medium mb-2">{selectedLocation.formattedAddress}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Street:</span>
              <p className="font-medium text-red-700">{selectedLocation.street}</p>
            </div>
            <div>
              <span className="text-gray-600">Number:</span>
              <p className="font-medium text-red-700">{selectedLocation.houseNumber}</p>
            </div>
            <div>
              <span className="text-gray-600">City:</span>
              <p className="font-medium text-red-700">{selectedLocation.city}</p>
            </div>
            <div>
              <span className="text-gray-600">Postal Code:</span>
              <p className="font-medium text-red-700">{selectedLocation.postalCode}</p>
            </div>
            <div>
              <span className="text-gray-600">Country:</span>
              <p className="font-medium text-red-700">{selectedLocation.country}</p>
            </div>
            {selectedLocation.latitude && selectedLocation.longitude && (
              <div>
                <span className="text-gray-600">Coordinates:</span>
                <p className="font-medium text-red-700 text-xs">
                  {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Component */}
      {notification && (
        <SimpleNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default LocationPicker;
