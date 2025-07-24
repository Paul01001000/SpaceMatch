import React, { useState, useEffect } from 'react';
import { CATEGORY_DEFINITIONS, SHARED_ATTRIBUTE_GROUPS } from '../constants/categories';
import { useNavigate } from 'react-router-dom';
import InfoTooltip from './InfoTooltip';
import { roundToNearest15Minutes , formatTime} from "../utils/dateTime";

interface SearchBarProps {
    initialFilters?: Record<string, any>;
}

interface SearchAttributeGroupProps {
  title: string;
  attributes: Array<{ key: string; label: string; type: string; description?: string; options?: string[]; validation?: any; placeholder?: string }>;
  categoryAttributes: Record<string, any>;
  onAttributeChange: (key: string, value: any) => void;
  isExpandable: boolean;
  isSharedGroup?: boolean;
}

const SearchAttributeGroup: React.FC<SearchAttributeGroupProps> = ({ 
  title, 
  attributes, 
  categoryAttributes, 
  onAttributeChange, 
  isExpandable,
  isSharedGroup = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(!isExpandable);
  
  const displayedAttributes = isExpanded ? attributes : attributes.slice(0, 2);

  return (
    <div className="space-y-3">
      <h5 className={`text-sm font-semibold flex items-center justify-between ${
        isSharedGroup ? 'text-blue-700' : 'text-red-700'
      }`}>
        <span className="flex items-center">
          {title}
          {isSharedGroup && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
              Shared
            </span>
          )}
        </span>
        {isExpandable && attributes.length > 2 && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
          >
            {isExpanded ? 'Show Less' : `Show All (${attributes.length})`}
          </button>
        )}
      </h5>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedAttributes.map(attr => (
          <div key={attr.key} className="flex items-center gap-2">
            {attr.type === 'boolean' ? (
              <>
                <input
                  type="checkbox"
                  checked={!!categoryAttributes[attr.key]}
                  onChange={e => onAttributeChange(attr.key, e.target.checked)}
                  className="mt-1"
                />
                <label className="text-sm flex items-center">
                  {attr.label}
                  <InfoTooltip text={attr.description || `Filter by ${attr.label}`} />
                </label>
              </>
            ) : attr.type === 'select' ? (
              <>
                <select
                  value={categoryAttributes[attr.key] || ''}
                  onChange={e => onAttributeChange(attr.key, e.target.value)}
                  className="w-1/2 border border-gray-300 px-3 py-2 rounded text-sm"
                >
                  <option value="">Select...</option>
                  {attr.options?.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <label className="text-sm flex items-center">
                  {attr.label}
                  <InfoTooltip text={attr.description || `Filter by ${attr.label}`} />
                </label>
              </>
            ) : (
              <>
                <input
                  type={attr.type}
                  value={categoryAttributes[attr.key] || ''}
                  onChange={e => onAttributeChange(attr.key, e.target.value)}
                  placeholder={attr.placeholder}
                  min={attr.type === 'number' && attr.validation?.min ? attr.validation.min : undefined}
                  max={attr.type === 'number' && attr.validation?.max ? attr.validation.max : undefined}
                  step={attr.type === 'number' ? 'any' : undefined}
                  className="w-1/2 border border-gray-300 px-3 py-2 rounded text-sm"
                />
                <label className="text-sm flex items-center">
                  {attr.label}
                  <InfoTooltip text={attr.description || `Filter by ${attr.label}`} />
                </label>
              </>
            )}
          </div>
        ))}
      </div>
      
      {!isExpanded && attributes.length > 2 && (
        <p className="text-xs text-gray-500">
          +{attributes.length - 2} more {title.toLowerCase()} filters
        </p>
      )}
    </div>
  );
};

const SearchBar: React.FC<SearchBarProps> = ({ initialFilters }) => {

    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [postalCode, setPostalCode] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [hours, minutes] = roundToNearest15Minutes(new Date().toTimeString().split(' ')[0]);
    const [from, setFrom] = useState(formatTime(hours,minutes)); // Default to current time
    const [to, setTo] = useState(formatTime(hours+1, minutes)); // Default to 15 minutes later
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [categoryAttributes, setCategoryAttributes] = useState<Record<string, any>>({});
    const [showFilters, setShowFilters] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [invalidInput, setInvalidInput] = useState<'date' | 'time' | 'price' | null>(null);
    const navigate = useNavigate();

    const handleAttributeChange = (key: string, value: any) => {
        setCategoryAttributes(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // Use reverse geocoding to get postal code from coordinates
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    const data = await response.json();
                    
                    if (data.postcode) {
                        setPostalCode(data.postcode);
                    } else {
                        alert('Could not determine postal code from current location.');
                    }
                } catch (error) {
                    console.error('Error getting location data:', error);
                    alert('Error getting location data. Please try again.');
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                setIsGettingLocation(false);
                console.error('Error getting location:', error);
                alert('Error getting your location. Please check your location permissions.');
            }
        );
    };

    useEffect(() => {
        if (!initialFilters) return;

        setSelectedCategory(initialFilters.categories?.[0] || '');
        setPostalCode(initialFilters.postalCode || '');
        setDate(initialFilters.date || date);
        setFrom(initialFilters.from || from);
        setTo(initialFilters.to || to);
        setMinPrice(initialFilters.minPrice?.toString() || '');
        setMaxPrice(initialFilters.maxPrice?.toString() || '');
        setCategoryAttributes(initialFilters.categoryAttributes || {});
    }, [initialFilters]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validierung der Eingaben
        if (!date && (from || to)) {
            setError('Please select a date if you specify time.');
            setInvalidInput('date');
            return;
        }
        if (from && to && from >= to) {
            setError('The "From" time must be earlier than the "To" time.');
            setInvalidInput('time');
            return;
        }
        if (minPrice && maxPrice && parseInt(minPrice) >= parseInt(maxPrice)) {
            setInvalidInput('price');
            setError('Minimum price must be less than maximum price.');
            return;
        }   
        if ((minPrice && parseInt(minPrice) < 0) || (maxPrice && parseInt(maxPrice) < 0)) {
            setInvalidInput('price');
            setError('Price cannot be negative.');
            return;
        }
        setError(null); // Reset error state if validation passes

        // 👉 Navigiere zu /search mit Query-Params
        const params = new URLSearchParams();
        if (postalCode) params.append('postalCode', postalCode);
        if (date) params.append('date', date);
        if (from) params.append('from', from);
        if (to) params.append('to', to);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (selectedCategory) params.append('category', selectedCategory);
        if (Object.keys(categoryAttributes).length > 0) {
            params.append('attributes', JSON.stringify(categoryAttributes));
        }

        navigate(`/search?${params.toString()}`);
    };

    const selectedCatDef = CATEGORY_DEFINITIONS.find(cat => cat.name === selectedCategory);

    return (
        <section className="bg-gray-50 py-6 flex justify-center w-full">
            <form onSubmit={handleSubmit} className="w-full max-w-5xl space-y-4 px-4">
                {/* 🔍 Top-Level 3x2 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="text-sm font-semibold flex flex-col">
                        Property Type:
                        <select
                            value={selectedCategory}
                            onChange={e => {
                                setSelectedCategory(e.target.value);
                                setCategoryAttributes({});
                            }}
                            className="mt-1 w-full border border-gray-300 px-3 py-2 rounded text-sm"
                        >
                            <option value="">Select category...</option>
                            {CATEGORY_DEFINITIONS.map(cat => (
                                <option key={cat.name} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="text-sm font-semibold flex flex-col">
                        Postal Code:
                        <div className="flex gap-2 mt-1">
                            <input
                                type="text"
                                value={postalCode}
                                onChange={e => setPostalCode(e.target.value)}
                                className="flex-1 border border-gray-300 px-3 py-2 rounded text-sm"
                            />
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={isGettingLocation}
                                className="px-3 py-2 bg-white border border-red-700 text-red-700 rounded text-sm hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                title="Get current location"
                            >
                                {isGettingLocation ? '⌖...' : '⌖'}
                            </button>
                        </div>
                    </label>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="bg-red-700 text-white px-6 py-2 rounded-full hover:bg-red-800 transition w-full"
                        >
                            Search
                        </button>
                    </div>

                    <label className="text-sm font-semibold flex flex-col">
                        Date:
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className={`mt-1 w-full border px-3 py-2 rounded text-sm ${
                                invalidInput === 'date' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                        />
                        {invalidInput === 'date' && error && (
                            <span className="text-xs text-red-600 mt-1">{error}</span>
                        )}
                    </label>

                    <label className="text-sm font-semibold flex flex-col">
                        From:
                        <input
                            type="time"
                            value={from}
                            onChange={e => {
                                const [hours, minutes] = roundToNearest15Minutes(e.target.value);
                                setFrom(formatTime(hours, minutes));
                            }}
                            className={`mt-1 w-full border px-3 py-2 rounded text-sm ${
                                invalidInput === 'time' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                        />
                    </label>

                    <label className="text-sm font-semibold flex flex-col">
                        To:
                        <input
                            type="time"
                            value={to}
                            onChange={e => {
                                const [hours, minutes] = roundToNearest15Minutes(e.target.value);
                                setTo(formatTime(hours, minutes));
                            }}
                            className={`mt-1 w-full border px-3 py-2 rounded text-sm ${
                                invalidInput === 'time' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                        />
                        {invalidInput === 'time' && error && (
                            <span className="text-xs text-red-600 mt-1">{error}</span>
                        )}
                    </label>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={() => setShowFilters(prev => !prev)}
                            className="border border-gray-400 px-6 py-2 rounded-full text-sm text-gray-700 hover:bg-gray-100 w-full"
                        >
                            Filter ▼
                        </button>
                    </div>
                </div>

                {/* ⬇️ Filter Dropdown */}
                {showFilters && (
                    <div className="border rounded-lg p-4 mt-2 bg-white shadow space-y-6">
                        {/* Price Filter */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={e => setMinPrice(e.target.value)}
                                    className={`border px-3 py-2 rounded text-sm w-full ${
                                        invalidInput === 'price' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="Min Price (in cents)"
                                />
                            </label>

                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={e => setMaxPrice(e.target.value)}
                                    className={`border px-3 py-2 rounded text-sm w-full ${
                                        invalidInput === 'price' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                                    placeholder="Max Price (in cents)"
                                />
                            </label>

                            {invalidInput === 'price' && error && (
                                <div className="col-span-2 text-xs text-red-600 mt-1">{error}</div>
                            )}
                        </div>

                        {/* Category-specific and shared attributes */}
                        {selectedCatDef && (
                            <div className="space-y-6">
                                {/* Category-specific basic attributes */}
                                {selectedCatDef.attributes.length > 0 && (
                                    <SearchAttributeGroup
                                        title="Basic Filters"
                                        attributes={selectedCatDef.attributes}
                                        categoryAttributes={categoryAttributes}
                                        onAttributeChange={handleAttributeChange}
                                        isExpandable={selectedCatDef.attributes.length > 2}
                                    />
                                )}

                                {/* Equipment groups */}
                                {selectedCatDef.equipmentGroup && (
                                    <SearchAttributeGroup
                                        title={selectedCatDef.equipmentGroup.label}
                                        attributes={selectedCatDef.equipmentGroup.attributes}
                                        categoryAttributes={categoryAttributes}
                                        onAttributeChange={handleAttributeChange}
                                        isExpandable={selectedCatDef.equipmentGroup.attributes.length > 2}
                                    />
                                )}

                                {/* Specific equipment groups */}
                                {(selectedCatDef as any).officeEquipmentGroup && (
                                    <SearchAttributeGroup
                                        title={(selectedCatDef as any).officeEquipmentGroup.label}
                                        attributes={(selectedCatDef as any).officeEquipmentGroup.attributes}
                                        categoryAttributes={categoryAttributes}
                                        onAttributeChange={handleAttributeChange}
                                        isExpandable={(selectedCatDef as any).officeEquipmentGroup.attributes.length > 2}
                                    />
                                )}

                                {(selectedCatDef as any).officeAmenitiesGroup && (
                                    <SearchAttributeGroup
                                        title={(selectedCatDef as any).officeAmenitiesGroup.label}
                                        attributes={(selectedCatDef as any).officeAmenitiesGroup.attributes}
                                        categoryAttributes={categoryAttributes}
                                        onAttributeChange={handleAttributeChange}
                                        isExpandable={(selectedCatDef as any).officeAmenitiesGroup.attributes.length > 2}
                                    />
                                )}

                                {(selectedCatDef as any).studioEquipmentGroup && (
                                    <SearchAttributeGroup
                                        title={(selectedCatDef as any).studioEquipmentGroup.label}
                                        attributes={(selectedCatDef as any).studioEquipmentGroup.attributes}
                                        categoryAttributes={categoryAttributes}
                                        onAttributeChange={handleAttributeChange}
                                        isExpandable={(selectedCatDef as any).studioEquipmentGroup.attributes.length > 2}
                                    />
                                )}

                                {(selectedCatDef as any).eventEquipmentGroup && (
                                    <SearchAttributeGroup
                                        title={(selectedCatDef as any).eventEquipmentGroup.label}
                                        attributes={(selectedCatDef as any).eventEquipmentGroup.attributes}
                                        categoryAttributes={categoryAttributes}
                                        onAttributeChange={handleAttributeChange}
                                        isExpandable={(selectedCatDef as any).eventEquipmentGroup.attributes.length > 2}
                                    />
                                )}

                                {(selectedCatDef as any).vehicleTypeGroup && (
                                    <SearchAttributeGroup
                                        title={(selectedCatDef as any).vehicleTypeGroup.label}
                                        attributes={(selectedCatDef as any).vehicleTypeGroup.attributes}
                                        categoryAttributes={categoryAttributes}
                                        onAttributeChange={handleAttributeChange}
                                        isExpandable={(selectedCatDef as any).vehicleTypeGroup.attributes.length > 2}
                                    />
                                )}

                                {/* Shared attribute groups */}
                                {selectedCatDef.sharedAttributeGroups?.map(groupName => {
                                    const group = SHARED_ATTRIBUTE_GROUPS[groupName as keyof typeof SHARED_ATTRIBUTE_GROUPS];
                                    return group ? (
                                        <SearchAttributeGroup
                                            key={groupName}
                                            title={group.label}
                                            attributes={group.attributes}
                                            categoryAttributes={categoryAttributes}
                                            onAttributeChange={handleAttributeChange}
                                            isExpandable={group.attributes.length > 2}
                                            isSharedGroup={true}
                                        />
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>
                )}
            </form>
        </section>
    );
};

export default SearchBar;
