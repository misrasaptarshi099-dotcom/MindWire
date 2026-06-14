import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch {
  batchId: string;
  name: string;
  seats: number;
  enrolled: number;
}

export interface IWorkshop extends Document {
  workshopId: string;
  title: string;
  subtitle: string;
  ageGroup: {
    min: number;
    max: number;
  };
  durationWeeks: number;
  mode: 'online' | 'offline' | 'hybrid';
  feeINR: number;
  startDate: Date;
  endDate: Date;
  seatsTotal: number;
  seatsAvailable: number;
  status: 'upcoming' | 'active' | 'full' | 'completed';
  batches: IBatch[];
  createdAt: Date;
  updatedAt: Date;
}

const batchSchema = new Schema<IBatch>({
  batchId: { type: String, required: true },
  name: { type: String, required: true },
  seats: { type: Number, required: true },
  enrolled: { type: Number, default: 0 },
});

const workshopSchema = new Schema<IWorkshop>(
  {
    workshopId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    ageGroup: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    durationWeeks: {
      type: Number,
      required: true,
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: true,
    },
    feeINR: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    seatsTotal: {
      type: Number,
      required: true,
    },
    seatsAvailable: {
      type: Number,
      required: true,
      default: function (this: IWorkshop) {
        return this.seatsTotal;
      },
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'full', 'completed'],
      default: 'upcoming',
    },
    batches: [batchSchema],
  },
  {
    timestamps: true,
  }
);

export const Workshop = mongoose.model<IWorkshop>('Workshop', workshopSchema);
