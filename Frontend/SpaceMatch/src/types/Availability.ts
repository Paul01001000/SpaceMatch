export interface Availability {
  _id: string;
  spaceId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  specialPricing?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityRequest {
  spaceId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  repeat: "never" | "daily" | "weekly" | "bi-weekly" | "monthly";
  repetitions?: number;
  specialPricing?: number;
}


export interface AvailabilityFormData {
  date: Date;
  startTime: Date;
  endTime: Date;
  repeat: "never" | "daily" | "weekly" | "bi-weekly" | "monthly";
  repetitions?: number;
  specialPricing?: number;
}

export interface AvailabilityFormErrors {
  date: String;
  startTime: String;
  endTime: String;
  repeat: String;
  repetitions?: String;
  specialPricing: String;
}
