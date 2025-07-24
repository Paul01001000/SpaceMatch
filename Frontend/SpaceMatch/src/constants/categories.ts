/* 
@Juraj we left the attributes on purpose in the frontend to make this Information more accessible to potential webcrawlers and to ensure for a Future proof design where WebUIs might be less importtant to a business.
Also this information is not security sensitive.
*/

// Shared attribute groups that apply to all categories
export const SHARED_ATTRIBUTE_GROUPS = {
  accessibility: {
    label: "Accessibility Features",
    description: "Accessibility accommodations for people with disabilities",
    attributes: [
      { key: "hasWheelchairAccess", label: "Wheelchair Accessible", type: "boolean", description: "Entrance and facilities accessible for wheelchair users" },
      { key: "hasVisuallyImpairedGuidance", label: "Visually Impaired Guidance", type: "boolean", description: "Tactile guidance systems, braille signs, or audio assistance" },
      { key: "hasHearingLoopSystem", label: "Hearing Loop System", type: "boolean", description: "Induction loop system for hearing aid users" },
      { key: "hasAccessibleParking", label: "Accessible Parking", type: "boolean", description: "Designated parking spaces for disabled visitors" },
      { key: "hasAccessibleRestrooms", label: "Accessible Restrooms", type: "boolean", description: "ADA-compliant restroom facilities" },
      { key: "hasElevatorAccess", label: "Elevator Access", type: "boolean", description: "Elevator access to different floor levels" }
    ]
  },
  safety: {
    label: "Safety & Security",
    description: "Safety measures and security features",
    attributes: [
      { key: "hasFireExtinguisher", label: "Fire Extinguisher", type: "boolean", description: "Fire safety equipment available on-site" },
      { key: "hasEmergencyExit", label: "Emergency Exit", type: "boolean", description: "Clearly marked emergency evacuation routes" },
      { key: "hasSecurityCameras", label: "Security Cameras", type: "boolean", description: "CCTV surveillance system installed" },
      { key: "has24HourAccess", label: "24-Hour Access", type: "boolean", description: "Round-the-clock availability and access" },
      { key: "hasSecurityPersonnel", label: "Security Personnel", type: "boolean", description: "On-site security staff or guard service" }
    ]
  },
  amenities: {
    label: "Basic Amenities",
    description: "Essential facilities and conveniences",
    attributes: [
      { key: "hasWifi", label: "WiFi Internet", type: "boolean", description: "Wireless internet connectivity available" },
      { key: "hasAirConditioning", label: "Air Conditioning", type: "boolean", description: "Climate control and cooling system" },
      { key: "hasHeating", label: "Heating System", type: "boolean", description: "Heating system for cold weather" },
      { key: "hasRestrooms", label: "Restrooms", type: "boolean", description: "Toilet and washing facilities on-site" },
      { key: "hasKitchenAccess", label: "Kitchen Access", type: "boolean", description: "Access to kitchen or food preparation area" },
      { key: "hasParkingAvailable", label: "Parking Available", type: "boolean", description: "Parking spaces available for visitors" }
    ]
  }
};

export const CATEGORY_DEFINITIONS = [
  {
    name: "Conference Room",
    description: "Professional meeting spaces equipped for business presentations and group discussions",
    sharedAttributeGroups: ["accessibility", "safety", "amenities"], // Uses all shared groups
    attributes: [
      { 
        key: "numberOfChairs", 
        label: "Number of Chairs", 
        type: "number",
        description: "Total seating capacity for meeting participants",
        validation: {
          min: 1,
          max: 1000,
          required: true,
          errorMessage: "Number of chairs must be between 1 and 1000"
        }
      },
      { 
        key: "brightness", 
        label: "Natural Lighting", 
        type: "select", 
        options: ["dark", "medium", "bright"],
        description: "Natural lighting level of the room environment",
        validation: {
          required: false,
          errorMessage: "Please select a brightness level"
        }
      },
      { key: "hasSpeakersDesk", label: "Speaker's Desk", type: "boolean", description: "Dedicated podium or desk for speakers and presenters" },
      { key: "hasLightingAdjustments", label: "Lighting Adjustments", type: "boolean", description: "Adjustable lighting controls for presentations" }
    ],
    equipmentGroup: {
      label: "Audio/Visual Equipment",
      attributes: [
        { key: "hasMicrophone", label: "Microphone System", type: "boolean", description: "Audio equipment for enhanced voice projection" },
        { key: "hasBeamer", label: "Projector/Beamer", type: "boolean", description: "Projection equipment for presentations and visual displays" },
        { key: "hasWhiteboard", label: "Whiteboard", type: "boolean", description: "Writing surface for brainstorming and presentations" },
        { key: "hasVideoConferencing", label: "Video Conferencing", type: "boolean", description: "Equipment for remote meeting participation" },
        { key: "hasPresenter", label: "Presenter Remote", type: "boolean", description: "Wireless presenter remote for slide control" },
        { key: "hasSoundSystem", label: "Sound System", type: "boolean", description: "Professional audio system for clear sound distribution" }
      ]
    }
  },
  {
    name: "Parking Space",
    description: "Vehicle parking areas for cars, motorcycles, and other vehicles",
    sharedAttributeGroups: ["accessibility", "safety"], // Only accessibility and safety make sense
    attributes: [
      { 
        key: "length", 
        label: "Length (m)", 
        type: "number",
        description: "Maximum vehicle length that can fit in the space",
        validation: {
          min: 0.1,
          max: 50,
          step: 0.1,
          required: true,
          errorMessage: "Length must be between 0.1m and 50m"
        }
      },
      { 
        key: "width", 
        label: "Width (m)", 
        type: "number",
        description: "Space width including maneuvering room for vehicles",
        validation: {
          min: 0.1,
          max: 20,
          step: 0.1,
          required: true,
          errorMessage: "Width must be between 0.1m and 20m"
        }
      },
      { key: "hasRoof", label: "Covered Parking", type: "boolean", description: "Weather protection with covered parking" },
      { key: "hasElectricCharging", label: "Electric Vehicle Charging", type: "boolean", description: "EV charging station available" },
      { key: "isReservedSpace", label: "Reserved Space", type: "boolean", description: "Dedicated reserved parking space" },
      { key: "hasLighting", label: "Lighting", type: "boolean", description: "Adequate lighting for nighttime parking" }
    ],
    vehicleTypeGroup: {
      label: "Vehicle Type",
      attributes: [
        { key: "allowsCars", label: "Cars", type: "boolean", description: "Suitable for standard passenger cars" },
        { key: "allowsMotorcycles", label: "Motorcycles", type: "boolean", description: "Suitable for motorcycles and scooters" },
        { key: "allowsTrucks", label: "Trucks", type: "boolean", description: "Suitable for trucks and large vehicles" },
        { key: "allowsVans", label: "Vans", type: "boolean", description: "Suitable for vans and delivery vehicles" }
      ]
    }
  },
  {
    name: "Event Hall",
    description: "Large venues for weddings, parties, concerts, and major gatherings",
    sharedAttributeGroups: ["accessibility", "safety", "amenities"], // Uses all shared groups
    attributes: [
      { 
        key: "maxPeople", 
        label: "Maximum Capacity", 
        type: "number",
        description: "Maximum safe occupancy capacity for events",
        validation: {
          min: 1,
          max: 10000,
          required: true,
          errorMessage: "Maximum people must be between 1 and 10,000"
        }
      },
      { 
        key: "floorArea", 
        label: "Floor Area (sqm)", 
        type: "number",
        description: "Total usable floor space for events",
        validation: {
          min: 10,
          max: 5000,
          step: 0.1,
          required: true,
          errorMessage: "Floor area must be between 10 and 5,000 square meters"
        }
      },
      { key: "hasBar", label: "Bar", type: "boolean", description: "Bar area for serving drinks and beverages" },
      { 
        key: "numberOfTables", 
        label: "Number of Tables", 
        type: "number",
        description: "Available tables for dining or event setup",
        validation: {
          min: 0,
          max: 500,
          required: false,
          errorMessage: "Number of tables must be between 0 and 500"
        }
      },
      { 
        key: "numberOfSeats", 
        label: "Number of Seats", 
        type: "number",
        description: "Total seating capacity including chairs and benches",
        validation: {
          min: 0,
          max: 10000,
          required: false,
          errorMessage: "Number of seats must be between 0 and 10,000"
        }
      }
    ],
    eventEquipmentGroup: {
      label: "Event Equipment",
      attributes: [
        { key: "hasStage", label: "Performance Stage", type: "boolean", description: "Elevated platform for performances and presentations" },
        { key: "hasSoundSystem", label: "Professional Sound System", type: "boolean", description: "Professional audio equipment for events" },
        { key: "hasLightingSystem", label: "Event Lighting", type: "boolean", description: "Professional lighting system for events" },
        { key: "hasDanceFloor", label: "Dance Floor", type: "boolean", description: "Designated area for dancing activities" },
        { key: "hasCateringFacilities", label: "Catering Facilities", type: "boolean", description: "Kitchen or catering preparation area" }
      ]
    }
  },
  {
    name: "Private Office",
    description: "Dedicated workspace for focused work and private business activities",
    sharedAttributeGroups: ["accessibility", "safety", "amenities"], // Uses all shared groups
    attributes: [
      { 
        key: "deskCount", 
        label: "Number of Desks", 
        type: "number",
        description: "Number of individual workstations available",
        validation: {
          min: 1,
          max: 50,
          required: true,
          errorMessage: "Desk count must be between 1 and 50"
        }
      },
      { 
        key: "officeArea", 
        label: "Office Area (sqm)", 
        type: "number",
        description: "Total office floor space available",
        validation: {
          min: 5,
          max: 500,
          step: 0.1,
          required: true,
          errorMessage: "Office area must be between 5 and 500 square meters"
        }
      }
    ],
    officeEquipmentGroup: {
      label: "Office Equipment",
      attributes: [
        { key: "hasMonitor", label: "Computer Monitors", type: "boolean", description: "External computer displays provided" },
        { key: "hasPrinter", label: "Printer Access", type: "boolean", description: "Printing and scanning facilities available" },
        { key: "hasConferencePhone", label: "Conference Phone", type: "boolean", description: "Phone system for conference calls" },
        { key: "hasShredder", label: "Paper Shredder", type: "boolean", description: "Document shredding equipment available" }
      ]
    },
    officeAmenitiesGroup: {
      label: "Office Amenities",
      attributes: [
        { key: "hasCoffeeMachine", label: "Coffee Machine", type: "boolean", description: "Coffee and beverage preparation equipment" },
        { key: "hasBookingSoftware", label: "Booking System", type: "boolean", description: "Online booking and scheduling system" },
        { key: "hasReception", label: "Reception Service", type: "boolean", description: "Professional reception and guest service" }
      ]
    }
  },
  {
    name: "Studio",
    description: "Creative spaces for photography, video production, art, and media work",
    sharedAttributeGroups: ["accessibility", "safety", "amenities"], // Uses all shared groups
    attributes: [
      { 
        key: "area", 
        label: "Studio Area (sqm)", 
        type: "number",
        description: "Total floor space available for creative activities",
        validation: {
          min: 1,
          max: 1000,
          step: 0.1,
          required: true,
          errorMessage: "Area must be between 1 and 1,000 square meters"
        }
      },
      { 
        key: "ceilingHeight", 
        label: "Ceiling Height (m)", 
        type: "number",
        description: "Room height for equipment and creative setups",
        validation: {
          min: 2,
          max: 20,
          step: 0.1,
          required: false,
          errorMessage: "Ceiling height must be between 2 and 20 meters"
        }
      },
      { 
        key: "studioType", 
        label: "Studio Type", 
        type: "select", 
        options: ["photography", "video", "audio", "art", "multi-purpose"],
        description: "Primary intended use of the studio space",
        validation: {
          required: true,
          errorMessage: "Please select the studio type"
        }
      }
    ],
    studioEquipmentGroup: {
      label: "Studio Equipment",
      attributes: [
        { key: "hasProfessionalLighting", label: "Professional Lighting", type: "boolean", description: "Professional lighting equipment for photography/video" },
        { key: "hasGreenScreen", label: "Green Screen", type: "boolean", description: "Chroma key background for video effects" },
        { key: "hasBackdrops", label: "Photography Backdrops", type: "boolean", description: "Various backgrounds for photo shoots" },
        { key: "hasCameraEquipment", label: "Camera Equipment", type: "boolean", description: "Professional cameras and lenses available" },
        { key: "hasAudioRecording", label: "Audio Recording Setup", type: "boolean", description: "Professional audio recording equipment" },
        { key: "hasEditingStation", label: "Editing Workstation", type: "boolean", description: "Computer setup for post-production editing" }
      ]
    }
  },
];