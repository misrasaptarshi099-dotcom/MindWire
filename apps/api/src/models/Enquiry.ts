import mongoose, { Schema, Document } from 'mongoose';

export interface IEnquiry extends Document {
  enquiryId: string;
  referenceCode: string;
  name: string;
  email: string;
  phone: string;
  childName?: string;
  childAge?: number;
  message?: string;
  status: 'pending' | 'payment_initiated' | 'enrolled' | 'waitlisted' | 'cancelled';
  payment: {
    orderId?: string;
    paymentId?: string;
    status?: 'pending' | 'captured' | 'failed' | 'refunded';
    amount?: number;
    currency: string;
    capturedAt?: Date;
  };
  workshopId: string;
  batchId: string;
  ipAddress?: string;
  userAgent?: string;
  source?: 'organic' | 'paid' | 'referral';
  utmParams?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  enrolledAt?: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    enquiryId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    referenceCode: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    childName: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    childAge: {
      type: Number,
      min: 8,
      max: 14,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['pending', 'payment_initiated', 'enrolled', 'waitlisted', 'cancelled'],
      default: 'pending',
      index: true,
    },
    payment: {
      orderId: { type: String },
      paymentId: { type: String },
      status: {
        type: String,
        enum: ['pending', 'captured', 'failed', 'refunded'],
      },
      amount: { type: Number },
      currency: { type: String, default: 'INR' },
      capturedAt: { type: Date },
    },
    workshopId: {
      type: String,
      default: 'AI_ROBOTICS_SUMMER_2026',
    },
    batchId: {
      type: String,
      default: 'BATCH_01',
    },
    ipAddress: {
      type: String,
      select: false,
    },
    userAgent: {
      type: String,
      select: false,
    },
    source: {
      type: String,
      enum: ['organic', 'paid', 'referral'],
      default: 'organic',
    },
    utmParams: {
      type: Schema.Types.Mixed,
    },
    enrolledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
enquirySchema.index({ email: 1, workshopId: 1 }, { unique: true });
enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ 'payment.orderId': 1 });

export const Enquiry = mongoose.model<IEnquiry>('Enquiry', enquirySchema);
