import { z } from 'zod';

export const enquirySchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(100, { message: 'Name cannot exceed 100 characters.' })
    .trim(),
  email: z
    .string()
    .email({ message: 'Invalid email address.' })
    .lowercase()
    .trim(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: 'Phone number must be a valid 10-digit Indian mobile number.' })
    .trim(),
  childName: z
    .string()
    .max(60, { message: 'Child name cannot exceed 60 characters.' })
    .trim()
    .optional()
    .or(z.literal('')),
  childAge: z
    .preprocess(
      (val) => {
        if (val === '' || val === undefined || val === null) return undefined;
        const num = Number(val);
        return isNaN(num) ? val : num;
      },
      z
        .number({ message: 'Age must be a number.' })
        .min(8, { message: 'Age must be at least 8.' })
        .max(14, { message: 'Age cannot exceed 14.' })
        .optional()
    ),
  message: z
    .string()
    .max(500, { message: 'Message cannot exceed 500 characters.' })
    .trim()
    .optional()
    .or(z.literal('')),
  hp: z
    .string()
    .max(0, { message: 'Spam detected.' })
    .optional()
    .or(z.literal('')),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
