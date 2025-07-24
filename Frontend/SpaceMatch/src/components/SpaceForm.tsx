import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Space, SpaceFormData } from '../types/Space';
import { useSpace } from '../hooks/useSpace';
import { CATEGORY_DEFINITIONS, SHARED_ATTRIBUTE_GROUPS } from '../constants/categories';
import LocationPicker, { LocationDetails } from './LocationPicker';
import SimpleNotification from './SimpleNotification';
import InfoTooltip from './InfoTooltip';

interface SpaceFormProps {
  onSave?: (space: Space) => void;
  onCancel?: () => void;
}

interface AttributeGroupFormProps {
  title: string;
  attributes: Array<{ key: string; label: string; type: string; description?: string; options?: string[]; validation?: any; required?: boolean; placeholder?: string }>;
  categoryAttributes: Record<string, any>;
  categoryAttributeErrors: Record<string, string>;
  onAttributeChange: (key: string, value: any) => void;
  isExpandable: boolean;
  isSharedGroup?: boolean;
}

const AttributeGroupForm: React.FC<AttributeGroupFormProps> = ({ 
  title, 
  attributes, 
  categoryAttributes, 
  categoryAttributeErrors, 
  onAttributeChange, 
  isExpandable,
  isSharedGroup = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(!isExpandable);
  
  const displayedAttributes = isExpanded ? attributes : attributes.slice(0, 2);

  return (
    <div className="mb-6">
      <h5 className={`text-sm font-semibold mb-3 flex items-center justify-between ${
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
      
      <div className="grid grid-cols-1 gap-3">
        {displayedAttributes.map(attr => {
          const hasError = categoryAttributeErrors[attr.key];
          const inputClassName = hasError 
            ? "w-full p-2 border border-red-500 rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400"
            : "w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400";
          
          return (
            <div key={attr.key}>
              <label className="block mb-1 font-medium text-gray-700 flex items-center">
                {attr.label}
                {attr.required && <span className="text-red-500 ml-1">*</span>}
                <InfoTooltip text={attr.description || `Configuration for ${attr.label}`} />
              </label>
              {attr.type === 'boolean' ? (
                <label className="inline-flex items-center gap-2 hover:text-red-700 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!categoryAttributes[attr.key]}
                    onChange={e => onAttributeChange(attr.key, e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded accent-red-600"
                  />
                  <span className="text-gray-600">{attr.label}</span>
                </label>
              ) : attr.type === 'select' ? (
                <>
                  <select
                    value={categoryAttributes[attr.key] || ''}
                    onChange={e => onAttributeChange(attr.key, e.target.value)}
                    className={inputClassName}
                  >
                    <option value="">Select...</option>
                    {attr.options?.map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {hasError && <p className="mt-1 text-sm text-red-600">{hasError}</p>}
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
                    className={inputClassName}
                  />
                  {hasError && <p className="mt-1 text-sm text-red-600">{hasError}</p>}
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {!isExpanded && attributes.length > 2 && (
        <p className="text-xs text-gray-500 mt-2">
          +{attributes.length - 2} more {title.toLowerCase()} features
        </p>
      )}
    </div>
  );
};

const generateProviderId = () => `provider_${Math.random().toString(36).substring(2, 10)}`;

const SpaceForm: React.FC<SpaceFormProps> = ({ onSave, onCancel }) => {
  const spaceId = useParams().id; // Get spaceId from URL parameters
  const { space, loading, error, createSpace, updateSpace } = useSpace(spaceId);
  const [formData, setFormData] = useState<SpaceFormData>({
    providerId: '',
    country: '',
    postalCode: '',
    street: '',
    houseNumber: '',
    title: '',
    propertyDescription: '',
    active: true,
    images: '',
    imageCaptions: '',
    categories: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<SpaceFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<Record<string, any>>({});
  const [categoryAttributeErrors, setCategoryAttributeErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationDetails | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const navigate = useNavigate();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCategoryDropdown]);

  // Populate form when editing existing space
  useEffect(() => {
    if (space && spaceId) {
      setFormData({
        providerId: space.providerId,
        country: space.country,
        postalCode: space.postalCode.toString(),
        street: space.street,
        houseNumber: space.houseNumber,
        title: space.title,
        propertyDescription: space.propertyDescription,
        active: space.active,
        images: space.images.join(', '),
        imageCaptions: space.imageCaptions.join(', '),
        categories: space.categories.join(', '),
      });
      
      // Set the images array for display
      setImages(space.images || []);
      
      // Set categories
      setCategories(space.categories || []);
      
      // Set category attributes
      setCategoryAttributes(space.categoryAttributes || {});
      
      // Set the location for the address picker
      setSelectedLocation({
        country: space.country,
        postalCode: space.postalCode.toString(),
        street: space.street,
        houseNumber: space.houseNumber,
        city: '', // Space model doesn't have city, so set empty
        formattedAddress: `${space.street} ${space.houseNumber}, ${space.postalCode} ${space.country}`
      });
    }
  }, [space, spaceId]);

  // Generate providerId on mount if creating new
  useEffect(() => {
    if (!spaceId) {
      setFormData((prev) => ({
        ...prev,
        providerId: generateProviderId(), // Generate a random provider ID (because who wants to come up with one manually?)
      }));
    }
  }, [spaceId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name as keyof SpaceFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined, // Clear the error (because everyone deserves a second chance)
      }));
    }

    // Clear notifications when user starts fixing form
    if (notification && notification.type === 'error') {
      setNotification(null);
    }
  };

  // Handle category selection
  const handleCategoryChange = (selected: string[]) => {
    setCategories(selected);
    // Optionally reset categoryAttributes for new categories
    setCategoryAttributes({});
  };

  // Handle location selection from LocationPicker
  const handleLocationSelect = (location: LocationDetails) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      street: location.street,
      houseNumber: location.houseNumber,
      country: location.country,
      postalCode: location.postalCode,
    }));
    
    // Clear any location-related errors
    setFormErrors(prev => ({
      ...prev,
      street: undefined,
      houseNumber: undefined,
      country: undefined,
      postalCode: undefined,
    }));
  };

  // Validate category attribute
  const validateCategoryAttribute = (key: string, value: any, attribute: any): string | null => {
    if (!attribute.validation) return null;

    const validation = attribute.validation;
    
    // Check required fields
    if (validation.required && (value === undefined || value === null || value === '')) {
      return `${attribute.label} is required`;
    }

    // For number inputs
    if (attribute.type === 'number' && value !== '' && value !== undefined && value !== null) {
      const numValue = Number(value);
      
      // Check if it's a valid number
      if (isNaN(numValue)) {
        return `${attribute.label} must be a valid number`;
      }

      // Check minimum value
      if (validation.min !== undefined && numValue < validation.min) {
        return validation.errorMessage || `${attribute.label} must be at least ${validation.min}`;
      }

      // Check maximum value
      if (validation.max !== undefined && numValue > validation.max) {
        return validation.errorMessage || `${attribute.label} must be at most ${validation.max}`;
      }
    }

    return null;
  };

  // Handle attribute value change
  const handleAttributeChange = (key: string, value: any) => {
    setCategoryAttributes((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Find the attribute definition for validation from all possible sources
    let attribute = null;

    // Check shared attributes first
    for (const groupName of Object.keys(SHARED_ATTRIBUTE_GROUPS)) {
      const group = SHARED_ATTRIBUTE_GROUPS[groupName as keyof typeof SHARED_ATTRIBUTE_GROUPS];
      attribute = group.attributes.find(attr => attr.key === key);
      if (attribute) break;
    }

    // If not found in shared attributes, check category-specific attributes
    if (!attribute) {
      for (const catName of categories) {
        const catDef = CATEGORY_DEFINITIONS.find(def => def.name === catName);
        if (catDef) {
          // Check basic category attributes
          attribute = catDef.attributes.find(attr => attr.key === key);
          if (attribute) break;

          // Check equipment group attributes
          if (catDef.equipmentGroup) {
            attribute = catDef.equipmentGroup.attributes.find(attr => attr.key === key);
            if (attribute) break;
          }

          // Check specific equipment groups
          const anyDef = catDef as any;
          for (const groupKey of ['officeEquipmentGroup', 'officeAmenitiesGroup', 'studioEquipmentGroup', 'eventEquipmentGroup', 'vehicleTypeGroup']) {
            if (anyDef[groupKey]) {
              attribute = anyDef[groupKey].attributes.find(attr => attr.key === key);
              if (attribute) break;
            }
          }
          if (attribute) break;
        }
      }
    }
    
    if (attribute) {
      const error = validateCategoryAttribute(key, value, attribute);
      setCategoryAttributeErrors(prev => ({
        ...prev,
        [key]: error || undefined
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const fileArray = Array.from(files);
    const maxImages = 20; // Set a reasonable limit
    const currentImageCount = images.length;
    
    // Check if adding new images would exceed the limit
    if (currentImageCount + fileArray.length > maxImages) {
      setNotification({
        message: `You can upload a maximum of ${maxImages} images. You currently have ${currentImageCount} image(s). You can only add ${maxImages - currentImageCount} more.`,
        type: 'error'
      });
      return;
    }
    
    const newUrls: string[] = [];
    
    for (const file of fileArray) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          message: `File "${file.name}" is too large. Maximum size is 5MB.`,
          type: 'error'
        });
        continue;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setNotification({
          message: `File "${file.name}" is not an image. Please upload only image files.`,
          type: 'error'
        });
        continue;
      }
      
      // For demo: convert to base64, in production upload to cloud and save the URL
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      newUrls.push(base64);
    }
    
    // Append new images to existing ones instead of replacing them
    setImages(prevImages => [...prevImages, ...newUrls]);
    
    if (newUrls.length > 0) {
      setNotification({
        message: `${newUrls.length} image${newUrls.length > 1 ? 's' : ''} uploaded successfully!`,
        type: 'success'
      });
    }
    
    // Reset the file input so the same file can be uploaded again if needed
    e.target.value = '';
  };

  const validateForm = (): boolean => {
    const errors: Partial<SpaceFormData> = {};

    if (!formData.providerId.trim()) errors.providerId = 'Provider ID is required';
    if (!formData.country.trim()) errors.country = 'Country is required';
    if (!formData.postalCode.trim()) errors.postalCode = 'Postal code is required';
    if (isNaN(Number(formData.postalCode))) errors.postalCode = 'Postal code must be a number';
    if (!formData.street.trim()) errors.street = 'Street is required';
    if (!formData.houseNumber.trim()) errors.houseNumber = 'House number is required';
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.propertyDescription.trim()) errors.propertyDescription = 'Description is required';

    setFormErrors(errors);

    // Show notification for validation errors
    if (Object.keys(errors).length > 0) {
      const errorCount = Object.keys(errors).length;
      setNotification({
        message: `Please fill in all required fields (${errorCount} missing)`,
        type: 'error'
      });
      return false;
    }

    // Additional validation for categories
    if (categories.length === 0) {
      setNotification({
        message: 'Please select at least one category for your space',
        type: 'error'
      });
      return false;
    }

    // Validate category attributes
    const allSharedAttributeKeys = new Set<string>();
    const allAttributes: any[] = [];

    // Collect shared attributes (avoiding duplicates)
    categories.forEach(catName => {
      const catDef = CATEGORY_DEFINITIONS.find(def => def.name === catName);
      if (catDef?.sharedAttributeGroups) {
        catDef.sharedAttributeGroups.forEach(groupName => {
          const group = SHARED_ATTRIBUTE_GROUPS[groupName as keyof typeof SHARED_ATTRIBUTE_GROUPS];
          group?.attributes.forEach(attr => {
            if (!allSharedAttributeKeys.has(attr.key)) {
              allSharedAttributeKeys.add(attr.key);
              allAttributes.push(attr);
            }
          });
        });
      }
    });

    // Collect category-specific attributes and equipment groups
    categories.forEach(catName => {
      const catDef = CATEGORY_DEFINITIONS.find(def => def.name === catName);
      if (catDef) {
        // Add basic category attributes
        allAttributes.push(...catDef.attributes);

        // Add equipment group attributes
        if (catDef.equipmentGroup) {
          allAttributes.push(...catDef.equipmentGroup.attributes);
        }

        // Add specific equipment groups (office, studio, event, etc.)
        const anyDef = catDef as any;
        ['officeEquipmentGroup', 'officeAmenitiesGroup', 'studioEquipmentGroup', 'eventEquipmentGroup', 'vehicleTypeGroup'].forEach(groupKey => {
          if (anyDef[groupKey]) {
            allAttributes.push(...anyDef[groupKey].attributes);
          }
        });
      }
    });

    let hasAttributeErrors = false;
    const attributeErrors: Record<string, string> = {};

    allAttributes.forEach(attribute => {
      const value = categoryAttributes[attribute.key];
      const error = validateCategoryAttribute(attribute.key, value, attribute);
      if (error) {
        attributeErrors[attribute.key] = error;
        hasAttributeErrors = true;
      }
    });

    setCategoryAttributeErrors(attributeErrors);

    if (hasAttributeErrors) {
      const errorCount = Object.keys(attributeErrors).length;
      setNotification({
        message: `Please fix ${errorCount} category attribute error${errorCount > 1 ? 's' : ''}`,
        type: 'error'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const spaceData = {
        providerId: formData.providerId,
        country: formData.country,
        postalCode: Number(formData.postalCode),
        street: formData.street,
        houseNumber: formData.houseNumber,
        title: formData.title,
        propertyDescription: formData.propertyDescription,
        active: formData.active,
        images, // <-- array of strings (base64 or URLs)
        imageCaptions: [], // or as needed
        categories, // <-- array of strings
        categoryAttributes, // <-- object
        rating: 0, // Default rating for new spaces
      };

      console.log('Submitting space data:', spaceData); // ADDED CONSOLE LOG

      let savedSpace: Space;
      if (spaceId) {
        savedSpace = await updateSpace(spaceId, spaceData);
        setNotification({
          message: `Space "${formData.title}" updated successfully!`,
          type: 'success'
        });
      } else {
        savedSpace = await createSpace(spaceData);
        setNotification({
          message: `Space "${formData.title}" created successfully!`,
          type: 'success'
        });
      }

      // Wait for notification to be visible before calling onSave and navigating
      setTimeout(() => {
        if (onSave) {
          onSave(savedSpace);
        }
        // Navigate to Manage with My Spaces tab active after showing notification
        navigate('/my-spaces');
      }, 3000); // Show notification for 3 seconds before navigating
    } catch (err) {
      console.error('Failed to save space:', err);
      setNotification({
        message: `Failed to ${spaceId ? 'update' : 'create'} space. Please try again.`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && spaceId) {
    return <div className="text-center p-8 text-lg text-gray-600">Loading space...</div>;
  }

  const availableCategories = CATEGORY_DEFINITIONS.filter(
    cat => !categories.includes(cat.name)
  );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="mb-8 text-3xl font-bold text-gray-900 text-center">
        {spaceId ? 'Edit Space' : 'Create New Space'}
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            Basic Information
          </h3>
          

          <div className="mb-4">
            <label htmlFor="title" className="block mb-2 font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                formErrors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.title && (
              <span className="text-red-500 text-sm mt-1 block">{formErrors.title}</span>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="propertyDescription" className="block mb-2 font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="propertyDescription"
              name="propertyDescription"
              value={formData.propertyDescription}
              onChange={handleInputChange}
              rows={4}
              className={`w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                formErrors.propertyDescription ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.propertyDescription && (
              <span className="text-red-500 text-sm mt-1 block">{formErrors.propertyDescription}</span>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            Location
          </h3>
          
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialValue={selectedLocation?.formattedAddress || ''}
            initialLocation={selectedLocation || undefined}
            error={formErrors.street || formErrors.country || formErrors.postalCode}
            placeholder="Search for your space location..."
          />
        </div>

    

        {/* --- Category Selection --- */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            Categories
          </h3>
          <div className="mb-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(v => !v)}
              className="px-4 py-2 bg-red-700 text-white rounded-full hover:bg-red-800 transition-colors"
              disabled={availableCategories.length === 0}
            >
              Add Category
            </button>
            {showCategoryDropdown && availableCategories.length > 0 && (
              <div ref={dropdownRef} className="relative">
                <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                  <div className="p-3 text-sm text-gray-600 border-b border-gray-100 bg-gray-50 rounded-t-lg font-medium">
                    Select a category to add:
                  </div>
                  {availableCategories.map(cat => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => {
                        setCategories(prev => [...prev, cat.name]);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center justify-between group"
                    >
                      <span className="font-medium text-gray-700 group-hover:text-red-700">{cat.name}</span>
                      <InfoTooltip text={cat.description || `Configuration options for ${cat.name}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Selected categories and their attributes, side by side */}
          <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-2 pt-12">
            {categories.map(catName => {
              const cat = CATEGORY_DEFINITIONS.find(c => c.name === catName);
              if (!cat) return null;
              
              return (
                <div key={catName} className="min-w-[320px] bg-white rounded-lg p-4 relative shadow-md border-2 border-red-700">
                  <button
                    type="button"
                    onClick={() => {
                      setCategories(prev => prev.filter(c => c !== catName));
                      // Remove category-specific attributes, but keep shared ones if other categories use them
                      setCategoryAttributes(prev => {
                        const updated = { ...prev };
                        
                        // Remove basic category attributes
                        cat.attributes.forEach(attr => {
                          delete updated[attr.key];
                        });

                        // Remove equipment group attributes
                        if (cat.equipmentGroup) {
                          cat.equipmentGroup.attributes.forEach(attr => {
                            delete updated[attr.key];
                          });
                        }

                        // Remove specific equipment groups
                        const anyDef = cat as any;
                        ['officeEquipmentGroup', 'officeAmenitiesGroup', 'studioEquipmentGroup', 'eventEquipmentGroup', 'vehicleTypeGroup'].forEach(groupKey => {
                          if (anyDef[groupKey]) {
                            anyDef[groupKey].attributes.forEach((attr: any) => {
                              delete updated[attr.key];
                            });
                          }
                        });

                        // Only remove shared attributes if no other selected category uses them
                        const remainingCategories = categories.filter(c => c !== catName);
                        const remainingSharedKeys = new Set<string>();
                        
                        remainingCategories.forEach(otherCatName => {
                          const otherCat = CATEGORY_DEFINITIONS.find(c => c.name === otherCatName);
                          if (otherCat?.sharedAttributeGroups) {
                            otherCat.sharedAttributeGroups.forEach(groupName => {
                              const group = SHARED_ATTRIBUTE_GROUPS[groupName as keyof typeof SHARED_ATTRIBUTE_GROUPS];
                              group?.attributes.forEach(attr => {
                                remainingSharedKeys.add(attr.key);
                              });
                            });
                          }
                        });

                        // Remove shared attributes only if they're not used by remaining categories
                        if (cat.sharedAttributeGroups) {
                          cat.sharedAttributeGroups.forEach(groupName => {
                            const group = SHARED_ATTRIBUTE_GROUPS[groupName as keyof typeof SHARED_ATTRIBUTE_GROUPS];
                            group?.attributes.forEach(attr => {
                              if (!remainingSharedKeys.has(attr.key)) {
                                delete updated[attr.key];
                              }
                            });
                          });
                        }

                        return updated;
                      });
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full w-6 h-6 flex items-center justify-center text-xl font-bold transition-colors"
                    title="Remove category"
                  >
                    &times;
                  </button>
                  
                  <h4 className="text-base font-semibold text-red-800 mb-4 flex items-center pr-8">
                    {catName} Configuration
                    <InfoTooltip text={cat.description || `Configuration options for ${catName}`} />
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Basic category attributes */}
                    {cat.attributes.length > 0 && (
                      <AttributeGroupForm
                        title="Basic Information"
                        attributes={cat.attributes}
                        categoryAttributes={categoryAttributes}
                        categoryAttributeErrors={categoryAttributeErrors}
                        onAttributeChange={handleAttributeChange}
                        isExpandable={cat.attributes.length > 2}
                      />
                    )}

                    {/* Equipment groups */}
                    {cat.equipmentGroup && (
                      <AttributeGroupForm
                        title={cat.equipmentGroup.label}
                        attributes={cat.equipmentGroup.attributes}
                        categoryAttributes={categoryAttributes}
                        categoryAttributeErrors={categoryAttributeErrors}
                        onAttributeChange={handleAttributeChange}
                        isExpandable={cat.equipmentGroup.attributes.length > 2}
                      />
                    )}

                    {/* Specific equipment groups */}
                    {(cat as any).officeEquipmentGroup && (
                      <AttributeGroupForm
                        title={(cat as any).officeEquipmentGroup.label}
                        attributes={(cat as any).officeEquipmentGroup.attributes}
                        categoryAttributes={categoryAttributes}
                        categoryAttributeErrors={categoryAttributeErrors}
                        onAttributeChange={handleAttributeChange}
                        isExpandable={(cat as any).officeEquipmentGroup.attributes.length > 2}
                      />
                    )}

                    {(cat as any).officeAmenitiesGroup && (
                      <AttributeGroupForm
                        title={(cat as any).officeAmenitiesGroup.label}
                        attributes={(cat as any).officeAmenitiesGroup.attributes}
                        categoryAttributes={categoryAttributes}
                        categoryAttributeErrors={categoryAttributeErrors}
                        onAttributeChange={handleAttributeChange}
                        isExpandable={(cat as any).officeAmenitiesGroup.attributes.length > 2}
                      />
                    )}

                    {(cat as any).studioEquipmentGroup && (
                      <AttributeGroupForm
                        title={(cat as any).studioEquipmentGroup.label}
                        attributes={(cat as any).studioEquipmentGroup.attributes}
                        categoryAttributes={categoryAttributes}
                        categoryAttributeErrors={categoryAttributeErrors}
                        onAttributeChange={handleAttributeChange}
                        isExpandable={(cat as any).studioEquipmentGroup.attributes.length > 2}
                      />
                    )}

                    {(cat as any).eventEquipmentGroup && (
                      <AttributeGroupForm
                        title={(cat as any).eventEquipmentGroup.label}
                        attributes={(cat as any).eventEquipmentGroup.attributes}
                        categoryAttributes={categoryAttributes}
                        categoryAttributeErrors={categoryAttributeErrors}
                        onAttributeChange={handleAttributeChange}
                        isExpandable={(cat as any).eventEquipmentGroup.attributes.length > 2}
                      />
                    )}

                    {(cat as any).vehicleTypeGroup && (
                      <AttributeGroupForm
                        title={(cat as any).vehicleTypeGroup.label}
                        attributes={(cat as any).vehicleTypeGroup.attributes}
                        categoryAttributes={categoryAttributes}
                        categoryAttributeErrors={categoryAttributeErrors}
                        onAttributeChange={handleAttributeChange}
                        isExpandable={(cat as any).vehicleTypeGroup.attributes.length > 2}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Shared attributes section - shown only once for all selected categories */}
          {categories.length > 0 && (() => {
            const allSharedGroups = new Set<string>();
            const sharedGroupsData: Record<string, any> = {};
            
            // Collect all shared attribute groups from selected categories
            categories.forEach(catName => {
              const catDef = CATEGORY_DEFINITIONS.find(def => def.name === catName);
              if (catDef?.sharedAttributeGroups) {
                catDef.sharedAttributeGroups.forEach(groupName => {
                  if (!allSharedGroups.has(groupName)) {
                    allSharedGroups.add(groupName);
                    sharedGroupsData[groupName] = SHARED_ATTRIBUTE_GROUPS[groupName as keyof typeof SHARED_ATTRIBUTE_GROUPS];
                  }
                });
              }
            });

            if (allSharedGroups.size === 0) return null;

            return (
              <div className="mt-6 bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <h4 className="text-base font-semibold text-blue-800 mb-4 flex items-center">
                  <span>Shared Features</span>
                  <InfoTooltip text="These features apply to all selected categories and are shared to avoid duplication." />
                </h4>
                
                <div className="grid gap-4">
                  {Object.entries(sharedGroupsData).map(([groupName, groupData]) => (
                    <AttributeGroupForm
                      key={groupName}
                      title={groupData.label}
                      attributes={groupData.attributes}
                      categoryAttributes={categoryAttributes}
                      categoryAttributeErrors={categoryAttributeErrors}
                      onAttributeChange={handleAttributeChange}
                      isExpandable={groupData.attributes.length > 2}
                      isSharedGroup={true}
                    />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* --- Image Upload --- */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
            Images {images.length > 0 && <span className="text-sm text-gray-500">({images.length} uploaded)</span>}
          </h3>
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">
              Upload Images <span className="text-gray-400 text-sm">(JPG, PNG, etc.)</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition-colors"
              />
              <span className="text-gray-400 text-xs">Max 5MB each • Multiple images allowed</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              You can upload multiple images by selecting multiple files at once, or upload them one by one. 
              Each new upload will be added to your existing images. Maximum 20 images total.
            </p>
          </div>
          {images.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`preview-${idx}`} className="w-full h-32 object-cover rounded shadow" />
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold opacity-90 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setImages([]);
                    setNotification({
                      message: 'All images removed successfully',
                      type: 'info'
                    });
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                >
                  Clear All Images
                </button>
              </div>
            </>
          )}
        </div>

        {/* --- Action Buttons at the Bottom --- */}
        <div className="flex gap-4 justify-end pt-8 border-t border-gray-200 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-red-700 text-white rounded-full hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (spaceId ? 'Update Space' : 'Create Space')}
          </button>
        </div>
      </form>

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

export default SpaceForm;