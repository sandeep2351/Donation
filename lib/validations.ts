import { z } from 'zod';

// Donation validation
export const donationSchema = z.object({
  donorName: z.string().min(2, 'Name must be at least 2 characters'),
  donorEmail: z.string().email().optional().or(z.literal('')),
  donorPhone: z.string().optional().or(z.literal('')),
  amount: z.number().min(100, 'Minimum donation is 100'),
  paymentMethod: z.enum(['UPI', 'MANUAL', 'TRANSFER']),
  upiCode: z.number().optional(),
  transactionId: z.string().optional(),
  isAnonymous: z.boolean().default(false),
});

export type DonationInput = z.infer<typeof donationSchema>;

// Campaign Update validation
export const campaignUpdateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  author: z.string().min(2, 'Author name required'),
  date: z.coerce.date(),
  isPublished: z.boolean().optional(),
});

export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;

// Medical Report validation
export const medicalReportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  category: z.enum(['DIAGNOSIS', 'TREATMENT', 'SURGERY_PLAN', 'PROGRESS', 'LAB_REPORTS']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.coerce.date(),
  doctorName: z.string().optional(),
  hospital: z.string().optional(),
  isPublic: z.boolean().default(true),
  documentUrl: z.union([z.string().url(), z.literal('')]).optional(),
  documentFileName: z.string().optional(),
  documentCloudinaryId: z.string().optional(),
  documentMimeType: z.string().optional(),
  documentResourceType: z.enum(['image', 'raw']).optional(),
  fileSizeBytes: z.number().optional(),
});

export type MedicalReportInput = z.infer<typeof medicalReportSchema>;

export const medicalReportPatchSchema = z.object({
  title: z.string().min(3).optional(),
  category: z.enum(['DIAGNOSIS', 'TREATMENT', 'SURGERY_PLAN', 'PROGRESS', 'LAB_REPORTS']).optional(),
  description: z.string().min(10).optional(),
  date: z.coerce.date().optional(),
  doctorName: z.string().optional(),
  hospital: z.string().optional(),
  isPublic: z.boolean().optional(),
  documentUrl: z.union([z.string().url(), z.literal('')]).optional(),
  documentFileName: z.string().optional(),
  documentCloudinaryId: z.string().optional().nullable(),
  documentMimeType: z.string().optional().nullable(),
  documentResourceType: z.enum(['image', 'raw']).optional().nullable(),
  fileSizeBytes: z.number().optional().nullable(),
});

export const campaignUpdatePatchSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  author: z.string().optional(),
  date: z.coerce.date().optional(),
  imageUrl: z.union([z.string().url(), z.literal('')]).optional().nullable(),
  imageCloudinaryId: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
});

// Admin Login validation
export const adminLoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

// Campaign Settings validation
export const campaignSettingsSchema = z.object({
  targetAmount: z.number().min(1000, 'Target amount must be at least 1000'),
  siteName: z.string().max(120).optional(),
  campaignTitle: z.string().min(5, 'Campaign title required'),
  campaignDescription: z.string().min(20, 'Campaign description required'),
  fatherName: z.string().min(2, 'Father name required'),
  fatherAge: z.number().min(1).max(150),
  hospitalName: z.string().min(2, 'Hospital name required'),
  surgeryDate: z.date().optional(),
  emailContact: z.string().email('Valid email required'),
  phoneContact: z.string().regex(/^\+?[\d\s\-()]+$/, 'Valid phone number required'),
  allowPublicMessages: z.boolean().default(true),
});

export type CampaignSettingsInput = z.infer<typeof campaignSettingsSchema>;

// QR Code validation
export const qrCodeSchema = z.object({
  code: z.number(),
  upiString: z.string(),
  provider: z.enum(['GOOGLE_PAY', 'PHONEPE', 'PAYTM', 'POOL']),
  displayName: z.string(),
  isActive: z.boolean().default(true),
});

export type QRCodeInput = z.infer<typeof qrCodeSchema>;

const upiIdField = z
  .union([
    z.literal(''),
    z
      .string()
      .min(3)
      .max(100)
      .regex(/^[\w.+\-]+@[\w.\-]+$/i, 'Use UPI ID only, e.g. name@ybl'),
  ])
  .optional();

export const qrCodeUpdateSchema = z.object({
  imageUrl: z.union([z.string().url(), z.literal('')]).optional(),
  upiTargetApp: z.enum(['GOOGLE_PAY', 'PHONEPE', 'PAYTM', 'ANY']).optional(),
  upiId: upiIdField,
  upiString: z
    .union([
      z.literal(''),
      z
        .string()
        .min(10)
        .max(2048)
        .regex(/^upi:\/\/pay\?/i, 'Must look like upi://pay?pa=...'),
    ])
    .optional(),
  displayName: z.string().min(1).max(120).optional(),
  isActive: z.boolean().optional(),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Please write a bit more detail'),
});
