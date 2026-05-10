import mongoose from 'mongoose';
import { Admin, CampaignSettings, QRCode } from '@/lib/models';
import { hashPassword } from '@/lib/auth';

const DEFAULT_ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
/** In production, set `ADMIN_PASSWORD` explicitly. Dev falls back so you can run locally quickly. */
const DEFAULT_ADMIN_PASS =
  process.env.ADMIN_PASSWORD ||
  (process.env.NODE_ENV === 'production' ? '' : 'str@nger007');
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sandeepkalyan299@gmail.com';

/**
 * Runs after MongoDB connects. Creates baseline campaign settings, demo admin (if none),
 * and placeholder UPI QR rows so admins can paste Cloudinary image URLs later.
 */
export async function ensureApplicationDefaults(): Promise<void> {
  if (mongoose.connection.readyState !== 1) return;

  let settings = await CampaignSettings.findOne({});
  if (!settings) {
    settings = await CampaignSettings.create({
      targetAmount: 2_000_000,
      campaignTitle: "Help Save Dad's Life",
      campaignDescription:
        "Our father needs a lung transplant. Your support helps cover surgery, hospital care, and recovery.",
      fatherName: 'Father',
      fatherAge: 58,
      hospitalName: 'Hospital (update in admin)',
      emailContact: DEFAULT_ADMIN_EMAIL,
      phoneContact: '+91-0000000000',
      currentAmount: 0,
      allowPublicMessages: true,
    });
  } else {
    const patch: Record<string, string> = {};
    if (!settings.emailContact || settings.emailContact.includes('example.com')) {
      patch.emailContact = DEFAULT_ADMIN_EMAIL;
    }
    if (Object.keys(patch).length) {
      await CampaignSettings.updateOne({ _id: settings._id }, { $set: patch });
    }
  }

  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    if (!DEFAULT_ADMIN_PASS) {
      console.warn(
        '[ensure-seed] No admin user and ADMIN_PASSWORD is unset (required in production). Skipping admin creation.'
      );
    } else {
      await Admin.create({
        username: DEFAULT_ADMIN_USER,
        password: await hashPassword(DEFAULT_ADMIN_PASS),
        email: DEFAULT_ADMIN_EMAIL,
      });
    }
  } else if (process.env.SYNC_ADMIN_PASSWORD_ON_BOOT === 'true' && DEFAULT_ADMIN_PASS) {
    const existing = await Admin.findOne({ username: DEFAULT_ADMIN_USER });
    if (existing) {
      existing.password = await hashPassword(DEFAULT_ADMIN_PASS);
      existing.email = DEFAULT_ADMIN_EMAIL;
      await existing.save();
    }
  }

  const qrCount = await QRCode.countDocuments();
  if (qrCount === 0) {
    await QRCode.insertMany([
      {
        code: 1,
        upiString: 'family@paytm',
        provider: 'GOOGLE_PAY',
        displayName: 'Google Pay',
        isActive: true,
      },
      {
        code: 2,
        upiString: 'family@paytm',
        provider: 'PHONEPE',
        displayName: 'PhonePe',
        isActive: true,
      },
      {
        code: 3,
        upiString: 'family@paytm',
        provider: 'PAYTM',
        displayName: 'Paytm',
        isActive: true,
      },
    ]);
  }
}
