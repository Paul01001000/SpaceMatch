export interface Space {
  rating: number;
  _id?: string;
  providerId?: string; // Optional
  country: string;
  postalCode: number;
  street: string;
  houseNumber: string;
  title: string;
  propertyDescription: string;
  creationDate?: Date;
  lastUpdateDate?: Date;
  active: boolean;
  images: string[]; // base64 or URLs
  imageCaptions: string[];
  categories: string[];
  categoryAttributes: Record<string, any>; // <-- Add this line
  promoted?: Date; // Optional field for promotion status
  publishedDate?: Date;
  lastUpdate?: Date;
}

export interface SpaceFormData {
  providerId: string;
  country: string;
  postalCode: string;
  street: string;
  houseNumber: string;
  title: string;
  propertyDescription: string;
  active: boolean;
  images: string;
  imageCaptions: string;
  categories: string;
}