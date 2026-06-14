export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface AuthResponseData {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface EnquiryResponseData {
  enquiryId: string;
  referenceCode: string;
}

export interface WorkshopInfoResponseData {
  workshopId: string;
  title: string;
  subtitle: string;
  ageGroup: { min: number; max: number };
  durationWeeks: number;
  mode: 'online' | 'offline' | 'hybrid';
  feeINR: number;
  startDate: string;
  endDate: string;
  seatsTotal: number;
  seatsAvailable: number;
  status: 'upcoming' | 'active' | 'full' | 'completed';
}
