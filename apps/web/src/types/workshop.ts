export interface Workshop {
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
  batches: Array<{ batchId: string; name: string; seats: number; enrolled: number }>;
}
