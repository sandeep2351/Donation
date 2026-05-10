import mongoose, { Schema, Document } from 'mongoose';

// Admin User Model
export interface IAdmin extends Document {
  username: string;
  password: string;
  email: string;
  createdAt: Date;
  lastLogin?: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

// Donation Model
export interface IDonation extends Document {
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  donationDate: Date;
  upiCode: number;
  paymentMethod: 'UPI' | 'MANUAL' | 'TRANSFER';
  transactionId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED';
  notes?: string;
  /** Internal notes visible only in admin dashboard */
  adminNotes?: string;
  isAnonymous: boolean;
  createdAt: Date;
  confirmedAt?: Date;
  confirmedBy?: string;
}

const donationSchema = new Schema<IDonation>(
  {
    donorName: { type: String, required: true },
    donorEmail: String,
    donorPhone: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    donationDate: { type: Date, required: true },
    upiCode: Number,
    paymentMethod: { type: String, enum: ['UPI', 'MANUAL', 'TRANSFER'], required: true },
    transactionId: String,
    status: { type: String, enum: ['PENDING', 'CONFIRMED', 'RECEIVED'], default: 'PENDING' },
    notes: String,
    adminNotes: String,
    isAnonymous: { type: Boolean, default: false },
    confirmedAt: Date,
    confirmedBy: String,
  },
  { timestamps: true }
);

// QR Code Model
export interface IQRCode extends Document {
  code: number;
  /** NPCI payment URI, e.g. `upi://pay?pa=vpa@bank&pn=Name&cu=INR` — not the same as UPI ID alone; see SETUP.md */
  upiString: string;
  /** POOL = shared rotation slot; legacy rows may still use app-specific enums. */
  provider: 'GOOGLE_PAY' | 'PHONEPE' | 'PAYTM' | 'POOL';
  displayName: string;
  isActive: boolean;
  scannedCount: number;
  clickCount: number;
  lastScannedAt?: Date;
  imageUrl?: string;
  createdAt: Date;
}

const qrCodeSchema = new Schema<IQRCode>(
  {
    code: { type: Number, required: true, unique: true },
    upiString: { type: String, required: true },
    provider: { type: String, enum: ['GOOGLE_PAY', 'PHONEPE', 'PAYTM', 'POOL'], required: true },
    displayName: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    scannedCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    lastScannedAt: Date,
    imageUrl: String,
  },
  { timestamps: true }
);

// Medical Report Model
export interface IMedicalReport extends Document {
  title: string;
  category: 'DIAGNOSIS' | 'TREATMENT' | 'SURGERY_PLAN' | 'PROGRESS' | 'LAB_REPORTS';
  description: string;
  documentUrl?: string;
  documentCloudinaryId?: string;
  documentFileName?: string;
  /** image | raw (PDF and other non-image uploads in Cloudinary) */
  documentResourceType?: 'image' | 'raw';
  documentMimeType?: string;
  fileSizeBytes?: number;
  uploadedBy?: string;
  date: Date;
  doctorName?: string;
  hospital?: string;
  isPublic: boolean;
  createdAt: Date;
}

const medicalReportSchema = new Schema<IMedicalReport>(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['DIAGNOSIS', 'TREATMENT', 'SURGERY_PLAN', 'PROGRESS', 'LAB_REPORTS'],
      required: true,
    },
    description: { type: String, required: true },
    documentUrl: String,
    documentCloudinaryId: String,
    documentFileName: String,
    documentResourceType: { type: String, enum: ['image', 'raw'] },
    documentMimeType: String,
    fileSizeBytes: Number,
    uploadedBy: String,
    date: { type: Date, required: true },
    doctorName: String,
    hospital: String,
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Campaign Update Model
export interface ICampaignUpdate extends Document {
  title: string;
  content: string;
  author: string;
  imageUrl?: string;
  imageCloudinaryId?: string;
  date: Date;
  isPublished: boolean;
  createdAt: Date;
}

const campaignUpdateSchema = new Schema<ICampaignUpdate>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: String,
    imageCloudinaryId: String,
    date: { type: Date, required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Campaign Settings Model
export interface ICampaignSettings extends Document {
  targetAmount: number;
  /** Short name in the main nav (tabs). Hero uses `campaignTitle`. */
  siteName?: string;
  campaignTitle: string;
  campaignDescription: string;
  fatherName: string;
  fatherAge: number;
  hospitalName: string;
  surgeryDate?: Date;
  currentAmount: number;
  emailContact: string;
  phoneContact: string;
  allowPublicMessages: boolean;
  createdAt: Date;
}

const campaignSettingsSchema = new Schema<ICampaignSettings>(
  {
    targetAmount: { type: Number, required: true, default: 2000000 },
    siteName: String,
    campaignTitle: { type: String, required: true },
    campaignDescription: { type: String, required: true },
    fatherName: { type: String, required: true },
    fatherAge: { type: Number, required: true },
    hospitalName: { type: String, required: true },
    surgeryDate: Date,
    currentAmount: { type: Number, default: 0 },
    emailContact: { type: String, required: true },
    phoneContact: { type: String, required: true },
    allowPublicMessages: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// QR Log Model (for analytics)
export interface IQRLog extends Document {
  qrCodeId: string;
  action: 'SCAN' | 'CLICK' | 'DISPLAY';
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

const qrLogSchema = new Schema<IQRLog>(
  {
    qrCodeId: { type: String, required: true },
    action: { type: String, enum: ['SCAN', 'CLICK', 'DISPLAY'], required: true },
    timestamp: { type: Date, default: Date.now },
    userAgent: String,
    ipAddress: String,
  },
  { timestamps: true }
);

// Create or retrieve models
export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);
export const Donation = mongoose.models.Donation || mongoose.model<IDonation>('Donation', donationSchema);
// Next.js dev HMR reuses mongoose.models.* with the first-loaded schema; dropping avoids stale enums (e.g. missing POOL).
if (mongoose.models.QRCode) {
  delete mongoose.models.QRCode;
}
export const QRCode = mongoose.model<IQRCode>('QRCode', qrCodeSchema);
export const MedicalReport = mongoose.models.MedicalReport || mongoose.model<IMedicalReport>('MedicalReport', medicalReportSchema);
export const CampaignUpdate = mongoose.models.CampaignUpdate || mongoose.model<ICampaignUpdate>('CampaignUpdate', campaignUpdateSchema);
export const CampaignSettings = mongoose.models.CampaignSettings || mongoose.model<ICampaignSettings>('CampaignSettings', campaignSettingsSchema);
export const QRLog = mongoose.models.QRLog || mongoose.model<IQRLog>('QRLog', qrLogSchema);
