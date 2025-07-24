import { User, Space, Booking, Review, Availability, Chat } from ".";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

export const setupDemoData = async () => {
  const imageToDataURI = (filePath: string) => {
    try {
      const fileData = fs.readFileSync(filePath);
      const mimeType = `image/${path.extname(filePath).slice(1)}`;
      return `data:${mimeType};base64,${fileData.toString("base64")}`;
    } catch (error) {
      console.error(`Error reading image file ${filePath}:`, error);
      return "";
    }
  };
  // --- DEMO DATA SETUP ---
  // 1. Create provider user
  let provider = await User.findOne({ email: "chiragdhingra69@gmail.com" });
  if (!provider) {
    const hashedPassword = await bcrypt.hash("Match_12345", 10);
    const profilePicPath = path.join(
      __dirname,
      "spaceImages",
      "Coworking_Space2.png"
    );
    const profilePicture = imageToDataURI(profilePicPath);

    provider = await User.create({
      email: "chiragdhingra69@gmail.com",
      password: hashedPassword,
      firstName: "Chirag",
      lastName: "Dhingra",
      spaceProvider: true,
      registration: new Date(),
      emailVerified: true,
      emailVerificationToken: "",
      emailVerificationExpires: new Date(),
      profilePicture,
    });
    console.log("✅ Provider user created");
  }

  // 2. Create regular user Tobias
  let tobias = await User.findOne({ email: "cdhingra391@gmail.com" });
  if (!tobias) {
    const hashedPassword = await bcrypt.hash("Space_12345", 10);
    tobias = await User.create({
      email: "cdhingra391@gmail.com",
      password: hashedPassword,
      firstName: "Tobias",
      lastName: "Pohl",
      spaceProvider: false,
      registration: new Date(),
      emailVerified: true,
      emailVerificationToken: "",
      emailVerificationExpires: new Date(),
    });
    console.log("✅ Tobias user created");
  }

  // 3. Create 5 spaces for provider (no loop, custom titles/categories)
  let spaces = await Space.find();
  if (spaces.length < 5) {
    await Space.deleteMany({ providerId: provider._id });

    const imagePaths = {
      space1: path.join(__dirname, "spaceImages", "ABC_Dance_Studio.jpg"),
      space2: path.join(__dirname, "spaceImages", "Coworking_Space1.jpg"),
      space2_2: path.join(__dirname, "spaceImages", "Coworking_Space1_2.jpg"),
      space2_3: path.join(__dirname, "spaceImages", "Coworking_Space1_3.jpg"),
      space3: path.join(__dirname, "spaceImages", "Coworking_Space2.png"),
      space4: path.join(__dirname, "spaceImages", "Dance_Studio.png"),
      space5: path.join(__dirname, "spaceImages", "Yogaly.png"),
      space6: path.join(__dirname, "spaceImages", "Coworking_Space3.jpg"),
      space6_2: path.join(__dirname, "spaceImages", "Coworking_Space3_2.jpg"),
      space7: path.join(__dirname, "spaceImages", "Parkingspace.jpg"),
    };

    const spaceImagesAsBase64 = {
      space1: imageToDataURI(imagePaths.space1),
      space2: imageToDataURI(imagePaths.space2),
      space2_2: imageToDataURI(imagePaths.space2_2),
      space2_3: imageToDataURI(imagePaths.space2_3),
      space3: imageToDataURI(imagePaths.space3),
      space4: imageToDataURI(imagePaths.space4),
      space5: imageToDataURI(imagePaths.space5),
      space6: imageToDataURI(imagePaths.space6),
      space6_2: imageToDataURI(imagePaths.space6_2),
      space7: imageToDataURI(imagePaths.space7),
    };

    const space1 = await Space.create({
      providerId: provider._id,
      country: "Germany",
      city: "Berlin", // Add missing city
      postalCode: 10115,
      street: "Dance Street",
      houseNumber: "10",
      title: "ABC Dance Studio",
      propertyDescription: "Spacious dance studio for classes and rehearsals.",
      creationDate: new Date(),
      lastUpdateDate: new Date(),
      active: true,
      images: [spaceImagesAsBase64.space1, spaceImagesAsBase64.space4], // Multiple images
      imageCaptions: ["Dance Studio", "Additional View"],
      categories: ["Studio"],
      categoryAttributes: {
        // Basic Studio attributes
        area: 250,
        ceilingHeight: 4.5,
        studioType: "art",
        
        // Studio Equipment Group
        hasProfessionalLighting: true,
        hasGreenScreen: false,
        hasBackdrops: true,
        hasCameraEquipment: false,
        hasAudioRecording: true,
        hasEditingStation: false,
        
        // Shared Accessibility attributes
        hasWheelchairAccess: true,
        hasVisuallyImpairedGuidance: false,
        hasHearingLoopSystem: false,
        hasAccessibleParking: true,
        hasAccessibleRestrooms: true,
        hasElevatorAccess: false,
        
        // Shared Safety attributes
        hasFireExtinguisher: true,
        hasEmergencyExit: true,
        hasSecurityCameras: true,
        has24HourAccess: false,
        hasSecurityPersonnel: false,
        
        // Shared Amenities attributes
        hasWifi: true,
        hasAirConditioning: true,
        hasHeating: true,
        hasRestrooms: true,
        hasKitchenAccess: true,
        hasParkingAvailable: true,
      },
      promoted: new Date("2026-01-15T00:00:00.000Z"),
      publishedDate: new Date(),
      lastUpdate: new Date(),
      rating: 4.0, // Matches Tobias's review rating
      price: 50, // Add missing price field
    });
    const space2 = await Space.create({
      providerId: provider._id,
      country: "Germany",
      city: "Garching bei München",
      postalCode: 85748,
      street: "Boltzmannstraße",
      houseNumber: "15",
      title: "TechHub Garching - Innovation Workspace",
      propertyDescription:
        "Modern tech-focused coworking space in the heart of Garching's research district. Perfect for startups, researchers, and tech professionals. Features state-of-the-art equipment, high-speed fiber internet, and a collaborative atmosphere. Located near TUM campus with easy access to Munich's tech ecosystem.",
      creationDate: new Date(),
      lastUpdateDate: new Date(),
      active: true,
      images: [spaceImagesAsBase64.space2, spaceImagesAsBase64.space2_2, spaceImagesAsBase64.space2_3],
      imageCaptions: ["Main Workspace", "Meeting Area", "Phone Booth"],
      categories: ["Private Office"],
      categoryAttributes: {
        // Basic Office attributes
        deskCount: 12,
        officeArea: 180,
        
        // Office Equipment Group
        hasMonitor: true,
        hasPrinter: true,
        hasConferencePhone: true,
        hasShredder: true,
        
        // Office Amenities Group
        hasCoffeeMachine: true,
        hasBookingSoftware: true,
        hasReception: true,
        
        // Shared Accessibility attributes
        hasWheelchairAccess: true,
        hasVisuallyImpairedGuidance: true,
        hasHearingLoopSystem: false,
        hasAccessibleParking: true,
        hasAccessibleRestrooms: true,
        hasElevatorAccess: true,
        
        // Shared Safety attributes
        hasFireExtinguisher: true,
        hasEmergencyExit: true,
        hasSecurityCameras: true,
        has24HourAccess: true,
        hasSecurityPersonnel: true,
        
        // Shared Amenities attributes
        hasWifi: true,
        hasAirConditioning: true,
        hasHeating: true,
        hasRestrooms: true,
        hasKitchenAccess: true,
        hasParkingAvailable: true,
      },
      promoted: new Date("2026-01-20T00:00:00.000Z"),
      publishedDate: new Date(),
      lastUpdate: new Date(),
      rating: 5.0, // Matches Sarah's review rating
      price: 85,
    });
    const space3 = await Space.create({
      providerId: provider._id,
      country: "Germany",
      city: "Garching bei München",
      postalCode: 85748,
      street: "Boltzmannstraße",
      houseNumber: "13",
      title: "ResearchCo - Academic Coworking Hub",
      propertyDescription:
        "Premium coworking space designed for researchers, PhD students, and academic professionals. Features quiet work zones, collaboration areas, and meeting rooms equipped with the latest presentation technology. Walking distance to TUM and Max Planck institutes. Includes access to academic databases and research resources.",
      creationDate: new Date(),
      lastUpdateDate: new Date(),
      active: true,
      images: [
        spaceImagesAsBase64.space3,
        spaceImagesAsBase64.space6,
        spaceImagesAsBase64.space6_2,
      ],
      imageCaptions: ["Quiet Work Zone", "Collaboration Area", "Research Lounge"],
      categories: ["Private Office"],
      categoryAttributes: {
        // Basic Office attributes
        deskCount: 25,
        officeArea: 220,
        
        // Office Equipment Group
        hasMonitor: false,
        hasPrinter: true,
        hasConferencePhone: false,
        hasShredder: true,
        
        // Office Amenities Group
        hasCoffeeMachine: false,
        hasBookingSoftware: true,
        hasReception: false,
        
        // Shared Accessibility attributes
        hasWheelchairAccess: true,
        hasVisuallyImpairedGuidance: true,
        hasHearingLoopSystem: true,
        hasAccessibleParking: true,
        hasAccessibleRestrooms: true,
        hasElevatorAccess: true,
        
        // Shared Safety attributes
        hasFireExtinguisher: true,
        hasEmergencyExit: true,
        hasSecurityCameras: true,
        has24HourAccess: false,
        hasSecurityPersonnel: false,
        
        // Shared Amenities attributes
        hasWifi: true,
        hasAirConditioning: true,
        hasHeating: true,
        hasRestrooms: true,
        hasKitchenAccess: true,
        hasParkingAvailable: true,
      },
      publishedDate: new Date(),
      lastUpdate: new Date(),
      rating: 4.0, // Matches Max's review rating
      price: 95,
    });
    const space7 = await Space.create({
      providerId: provider._id,
      country: "Germany",
      city: "Garching bei München",
      postalCode: 85748,
      street: "Boltzmannstraße",
      houseNumber: "11",
      title: "StartupLoft Garching - Creative Workspace",
      propertyDescription:
        "Dynamic startup-focused coworking space with a creative twist. Open loft design with flexible workstations, brainstorming walls, and relaxed lounge areas. Perfect for creative entrepreneurs, designers, and small teams. Features maker space access, event hosting capabilities, and a vibrant community of innovators. Regular networking events and startup mentoring sessions.",
      creationDate: new Date(),
      lastUpdateDate: new Date(),
      active: true,
      images: [spaceImagesAsBase64.space6_2, spaceImagesAsBase64.space3],
      imageCaptions: ["Creative Loft Space", "Brainstorming Area"],
      categories: ["Private Office"],
      categoryAttributes: {
        // Basic Office attributes
        deskCount: 8,
        officeArea: 150,
        
        // Office Equipment Group
        hasMonitor: false,
        hasPrinter: true,
        hasConferencePhone: false,
        hasShredder: false,
        
        // Office Amenities Group
        hasCoffeeMachine: true,
        hasBookingSoftware: false,
        hasReception: false,
        
        // Shared Accessibility attributes
        hasWheelchairAccess: false,
        hasVisuallyImpairedGuidance: false,
        hasHearingLoopSystem: false,
        hasAccessibleParking: false,
        hasAccessibleRestrooms: true,
        hasElevatorAccess: false,
        
        // Shared Safety attributes
        hasFireExtinguisher: true,
        hasEmergencyExit: true,
        hasSecurityCameras: false,
        has24HourAccess: false,
        hasSecurityPersonnel: false,
        
        // Shared Amenities attributes
        hasWifi: true,
        hasAirConditioning: false,
        hasHeating: true,
        hasRestrooms: true,
        hasKitchenAccess: true,
        hasParkingAvailable: false,
      },
      publishedDate: new Date(),
      lastUpdate: new Date(),
      rating: 4.0, // Matches Anna's review rating
      price: 65,
      promoted: new Date("2025-08-30T00:00:00.000Z"), // Set promotion to end of August
    });
    const space4 = await Space.create({
      providerId: provider._id,
      country: "Germany",
      city: "Berlin", // Add missing city
      postalCode: 10118,
      street: "Studio Street",
      houseNumber: "13",
      title: "Dance Studio Berlin",
      propertyDescription:
        "Professional dance studio for events and workshops.",
      creationDate: new Date(),
      lastUpdateDate: new Date(),
      active: true,
      images: [spaceImagesAsBase64.space4],
      imageCaptions: ["Berlin Studio"],
      categories: ["Event Hall"],
      categoryAttributes: {
        // Basic Event Hall attributes
        maxPeople: 200,
        floorArea: 400,
        hasBar: true,
        numberOfTables: 20,
        numberOfSeats: 180,
        
        // Event Equipment Group
        hasStage: true,
        hasSoundSystem: true,
        hasLightingSystem: true,
        hasDanceFloor: true,
        hasCateringFacilities: true,
        
        // Shared Accessibility attributes
        hasWheelchairAccess: true,
        hasVisuallyImpairedGuidance: false,
        hasHearingLoopSystem: true,
        hasAccessibleParking: true,
        hasAccessibleRestrooms: true,
        hasElevatorAccess: false,
        
        // Shared Safety attributes
        hasFireExtinguisher: true,
        hasEmergencyExit: true,
        hasSecurityCameras: true,
        has24HourAccess: false,
        hasSecurityPersonnel: true,
        
        // Shared Amenities attributes
        hasWifi: true,
        hasAirConditioning: true,
        hasHeating: true,
        hasRestrooms: true,
        hasKitchenAccess: true,
        hasParkingAvailable: true,
      },
      publishedDate: new Date(),
      lastUpdate: new Date(),
      rating: 0.0,
      price: 200, // Add missing price field
    });
    const space5 = await Space.create({
      providerId: provider._id,
      country: "Germany",
      city: "Berlin", // Add missing city
      postalCode: 10119,
      street: "Yoga Street",
      houseNumber: "14",
      title: "Yogaly Studio",
      propertyDescription:
        "Peaceful yoga studio for group and private sessions.",
      creationDate: new Date(),
      lastUpdateDate: new Date(),
      active: true,
      images: [spaceImagesAsBase64.space5],
      imageCaptions: ["Yoga Studio"],
      categories: ["Studio"],
      categoryAttributes: {
        // Basic Studio attributes
        area: 150,
        ceilingHeight: 3.5,
        studioType: "multi-purpose",
        
        // Studio Equipment Group
        hasProfessionalLighting: false,
        hasGreenScreen: true,
        hasBackdrops: false,
        hasCameraEquipment: false,
        hasAudioRecording: false,
        hasEditingStation: false,
        
        // Shared Accessibility attributes
        hasWheelchairAccess: true,
        hasVisuallyImpairedGuidance: true,
        hasHearingLoopSystem: false,
        hasAccessibleParking: false,
        hasAccessibleRestrooms: true,
        hasElevatorAccess: false,
        
        // Shared Safety attributes
        hasFireExtinguisher: true,
        hasEmergencyExit: true,
        hasSecurityCameras: false,
        has24HourAccess: false,
        hasSecurityPersonnel: false,
        
        // Shared Amenities attributes
        hasWifi: true,
        hasAirConditioning: false,
        hasHeating: true,
        hasRestrooms: true,
        hasKitchenAccess: false,
        hasParkingAvailable: false,
      },
      publishedDate: new Date(),
      lastUpdate: new Date(),
      rating: 0.0, 
      price: 60, // Add missing price field
    });
    
    // Add a parking space example
    const space6 = await Space.create({
      providerId: provider._id,
      country: "Germany",
      city: "Berlin",
      postalCode: 10120,
      street: "Parking Street",
      houseNumber: "15",
      title: "Covered Parking Space",
      propertyDescription: "Secure covered parking space in city center.",
      creationDate: new Date(),
      lastUpdateDate: new Date(),
      active: true,
      images: [spaceImagesAsBase64.space7], 
      imageCaptions: ["Parking Area"],
      categories: ["Parking Space"],
      categoryAttributes: {
        // Basic Parking attributes
        length: 5.5,
        width: 2.5,
        hasRoof: true,
        hasElectricCharging: true,
        isReservedSpace: true,
        hasLighting: true,
        
        // Vehicle Type Group (new structure)
        allowsCars: true,
        allowsMotorcycles: true,
        allowsTrucks: false,
        allowsVans: true,
        
        // Shared Accessibility attributes (only relevant ones)
        hasWheelchairAccess: true,
        hasVisuallyImpairedGuidance: false,
        hasHearingLoopSystem: false,
        hasAccessibleParking: true,
        hasAccessibleRestrooms: false,
        hasElevatorAccess: false,
        
        // Shared Safety attributes
        hasFireExtinguisher: false,
        hasEmergencyExit: true,
        hasSecurityCameras: true,
        has24HourAccess: true,
        hasSecurityPersonnel: false,
      },
      publishedDate: new Date(),
      lastUpdate: new Date(),
      rating: 0.0,
      price: 25,
    });
    
    spaces = [space1, space2, space3, space4, space5, space6];
    console.log("✅ 6 spaces created for provider (including parking space)");
  }

  // 4. Create 2 bookings for Tobias for any 2 spaces
  let bookings = await Booking.find();
  if (bookings.length < 2) {
    // Remove old bookings for clean setup
    await Booking.deleteMany({ userId: tobias._id });
    bookings = [];
    const today = new Date(new Date().toISOString().split("T")[0]);
    for (let i = 0; i < 2; i++) {
      const space = spaces[i];
      const bookingDate = new Date(today);
      bookingDate.setDate(Math.max(today.getDate() - 5*i,1)); // today + i days

      const booking = await Booking.create({
        userId: tobias._id,
        spaceId: space._id,
        dateOfBooking: new Date(bookingDate), // Book for today + i days
        startTime: new Date(bookingDate.setHours(10 + i, 0, 0, 0)),
        endTime: new Date(bookingDate.setHours(15 + i, 30, 0, 0)),
        totalPrice: 100 + i * 50,
        status: "confirmed",
        bookingUserName: `${tobias.firstName} ${tobias.lastName}`,
        spaceTitle: space.title,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      bookings.push(booking);
    }
    console.log("✅ 2 bookings created for Tobias");
  }

  // 5. Tobias creates 1 review for the first booking only
  let reviews = await Review.find();
  if (reviews.length < 1) {
    // Remove old reviews for clean setup
    await Review.deleteMany({ userId: tobias._id });
    // Only create 1 review for the first booking (i = 0)
    await Review.create({
      userId: tobias._id,
      spaceId: spaces[0]._id,
      bookingId: bookings[0]._id,
      rating: 4,
      reviewerName: `${tobias.firstName} ${tobias.lastName}`,
      description: `Great space! Really enjoyed my time at the ABC Dance Studio. The facilities were clean and well-maintained.`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ 1 review created for Tobias (first booking only)");
  }

  // 6. Add detailed reviews for the coworking spaces in Garching
  let workspaceReviews = await Review.find({ userId: { $ne: tobias._id } });
  if (workspaceReviews.length < 3) {
    // Create a second user for reviews
    let reviewer1 = await User.findOne({ email: "sarah.mueller@example.com" });
    if (!reviewer1) {
      const hashedPassword = await bcrypt.hash("Review_12345", 10);
      reviewer1 = await User.create({
        email: "sarah.mueller@example.com",
        password: hashedPassword,
        firstName: "Sarah",
        lastName: "Müller",
        spaceProvider: false,
        registration: new Date(),
        emailVerified: true,
        emailVerificationToken: "",
        emailVerificationExpires: new Date(),
      });
    }

    let reviewer2 = await User.findOne({ email: "max.weber@tum.de" });
    if (!reviewer2) {
      const hashedPassword = await bcrypt.hash("Review_67890", 10);
      reviewer2 = await User.create({
        email: "max.weber@tum.de",
        password: hashedPassword,
        firstName: "Max",
        lastName: "Weber",
        spaceProvider: false,
        registration: new Date(),
        emailVerified: true,
        emailVerificationToken: "",
        emailVerificationExpires: new Date(),
      });
    }

    let reviewer3 = await User.findOne({ email: "anna.schmidt@startup.com" });
    if (!reviewer3) {
      const hashedPassword = await bcrypt.hash("Review_54321", 10);
      reviewer3 = await User.create({
        email: "anna.schmidt@startup.com",
        password: hashedPassword,
        firstName: "Anna",
        lastName: "Schmidt",
        spaceProvider: false,
        registration: new Date(),
        emailVerified: true,
        emailVerificationToken: "",
        emailVerificationExpires: new Date(),
      });
    }

    // Create fake bookings for these reviews
    const techHubSpace = await Space.findOne({ title: "TechHub Garching - Innovation Workspace" });
    const researchCoSpace = await Space.findOne({ title: "ResearchCo - Academic Coworking Hub" });
    const startupLoftSpace = await Space.findOne({ title: "StartupLoft Garching - Creative Workspace" });

    if (techHubSpace && researchCoSpace && startupLoftSpace) {
      // Create bookings for the reviewers
      const reviewBooking1 = await Booking.create({
        userId: reviewer1._id,
        spaceId: techHubSpace._id,
        dateOfBooking: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        totalPrice: 340,
        status: "confirmed",
        bookingUserName: `${reviewer1.firstName} ${reviewer1.lastName}`,
        spaceTitle: techHubSpace.title,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      });

      const reviewBooking2 = await Booking.create({
        userId: reviewer2._id,
        spaceId: researchCoSpace._id,
        dateOfBooking: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000),
        totalPrice: 380,
        status: "confirmed",
        bookingUserName: `${reviewer2.firstName} ${reviewer2.lastName}`,
        spaceTitle: researchCoSpace.title,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      });

      const reviewBooking3 = await Booking.create({
        userId: reviewer3._id,
        spaceId: startupLoftSpace._id,
        dateOfBooking: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000),
        totalPrice: 260,
        status: "confirmed",
        bookingUserName: `${reviewer3.firstName} ${reviewer3.lastName}`,
        spaceTitle: startupLoftSpace.title,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      });

      // Create detailed reviews
      await Review.create({
        userId: reviewer1._id,
        spaceId: techHubSpace._id,
        bookingId: reviewBooking1._id,
        rating: 5,
        reviewerName: `${reviewer1.firstName} ${reviewer1.lastName}`,
        description: "Absolutely fantastic workspace! The TechHub exceeded all my expectations. The high-speed fiber internet was blazing fast - perfect for our video conferences with international clients. The equipment is top-notch with excellent monitors and professional setup. The location near TUM is incredibly convenient, and the atmosphere really fosters innovation and collaboration. The 24/7 access was crucial for our project deadlines. Highly recommend to any tech professional or startup team!",
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      });

      await Review.create({
        userId: reviewer2._id,
        spaceId: researchCoSpace._id,
        bookingId: reviewBooking2._id,
        rating: 4,
        reviewerName: `${reviewer2.firstName} ${reviewer2.lastName}`,
        description: "Great academic environment for research work. The quiet zones are genuinely quiet and perfect for deep focus sessions. The meeting rooms with presentation technology worked flawlessly for our thesis defense preparation. Access to academic databases was a nice touch. The proximity to Max Planck institutes is excellent for networking. Only minor issue was that the coffee machine was out of order during my visit, but overall a solid choice for academic work. The hearing loop system worked perfectly for our hearing-impaired colleague.",
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      });

      await Review.create({
        userId: reviewer3._id,
        spaceId: startupLoftSpace._id,
        bookingId: reviewBooking3._id,
        rating: 4,
        reviewerName: `${reviewer3.firstName} ${reviewer3.lastName}`,
        description: "Perfect creative space for our startup team! The open loft design really sparks creativity and the brainstorming walls were incredibly useful for our design thinking sessions. The relaxed atmosphere helps break down formal barriers and encourages open communication. The community of innovators is amazing - we made valuable connections during the networking events. The maker space access was a bonus for prototyping. Only wished they had monitors available, but the overall vibe and community more than make up for it. Great value for money!",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      });

      console.log("✅ 3 detailed workspace reviews created with proper bookings");
    }
  }

  // 7. Create basic chat data between Chirag and Tobias for first booking
  let chats = await Chat.find();
  if (chats.length === 0) {
    // Remove any existing chats for this booking first (safety measure)
    await Chat.deleteMany({ bookingId: bookings[0]._id });

    // Create a single chat document with multiple messages
    const chatConversation = await Chat.create({
      bookingId: bookings[0]._id,
      participants: [tobias._id.toString(), provider._id.toString()], // Array of user ID strings
      participantNames: {
        [tobias._id.toString()]: `${tobias.firstName} ${tobias.lastName}`,
        [provider._id.toString()]: `${provider.firstName} ${provider.lastName}`,
      }, // Object mapping IDs to names
      messages: [
        {
          senderId: tobias._id,
          senderName: `${tobias.firstName} ${tobias.lastName}`,
          message:
            "Hi! I have a booking for your dance studio tomorrow. Is there parking available nearby?",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: true,
        },
        {
          senderId: provider._id,
          senderName: `${provider.firstName} ${provider.lastName}`,
          message:
            "Hello Tobias! Yes, there's free street parking right in front of the building. Looking forward to seeing you tomorrow!",
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
          read: true,
        },
        {
          senderId: tobias._id,
          senderName: `${tobias.firstName} ${tobias.lastName}`,
          message:
            "Perfect! Also, do you have a sound system I can connect my phone to?",
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          read: true,
        },
        {
          senderId: provider._id,
          senderName: `${provider.firstName} ${provider.lastName}`,
          message:
            "Absolutely! We have a Bluetooth-enabled sound system. You'll find the connection instructions on the wall next to the speakers.",
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          read: false,
        },
      ],
      lastMessageAt: new Date(Date.now() - 30 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Chat conversation created between Chirag and Tobias");
  }

  // 8. Create some availability slots for the spaces
  let availabilities = await Availability.find();
  if (availabilities.length === 0) {
    console.log("Creating availability slots for spaces...");
    const today = new Date(new Date().toISOString().split("T")[0]);

    for (let i = 0; i < spaces.length; i++) {
      const space = spaces[i];
      // Create availability for next 30 days
      for (let day = 0; day < 30; day++) {
        const availabilityDate = new Date(today);
        availabilityDate.setDate(today.getDate() + day); // today + i days

        const startTime = new Date(new Date(availabilityDate).setHours(8, 0, 0, 0));
        const endTime = new Date(new Date(availabilityDate).setHours(20, 0, 0, 0));
        
        await Availability.create({
          spaceId: space._id,
          date: availabilityDate, // ✅ Required field
          startTime: startTime, // ✅ Required field
          endTime: endTime, // ✅ Required field
          isAvailable: true,
          specialPricing: 50 - day + i, // ✅ Use specialPricing instead of price
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
    console.log("✅ Availability slots created for all spaces");

    // Add specific Friday August 8th, 1-3pm slots with different pricing for the coworking spaces
    const fridayAugust8 = new Date("2025-08-08T13:00:00.000Z");
    const fridayEndTime = new Date("2025-08-08T15:00:00.000Z");

    // Find the Garching coworking spaces by their titles
    const techHubSpace = await Space.findOne({ title: "TechHub Garching - Innovation Workspace" });
    const researchCoSpace = await Space.findOne({ title: "ResearchCo - Academic Coworking Hub" });
    const startupLoftSpace = await Space.findOne({ title: "StartupLoft Garching - Creative Workspace" });

    if (techHubSpace) {
      await Availability.create({
        spaceId: techHubSpace._id,
        date: fridayAugust8,
        startTime: fridayAugust8,
        endTime: fridayEndTime,
        isAvailable: true,
        specialPricing: 90,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (researchCoSpace) {
      await Availability.create({
        spaceId: researchCoSpace._id,
        date: fridayAugust8,
        startTime: fridayAugust8,
        endTime: fridayEndTime,
        isAvailable: true,
        specialPricing: 110,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (startupLoftSpace) {
      await Availability.create({
        spaceId: startupLoftSpace._id,
        date: fridayAugust8,
        startTime: fridayAugust8,
        endTime: fridayEndTime,
        isAvailable: true,
        specialPricing: 70,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log("✅ Special Friday August 8th availability slots created for Garching coworking spaces");
  }
};
