import axios from 'axios';
import crypto from 'crypto';

const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

/** Must match the upload preset name in Cloudinary (case-sensitive). Override with CLOUDINARY_UPLOAD_PRESET. */
const CLOUDINARY_UPLOAD_PRESET =
  process.env.CLOUDINARY_UPLOAD_PRESET?.trim() || 'Donation';

/**
 * If your preset is **unsigned** in Cloudinary, set `CLOUDINARY_PRESET_UNSIGNED=true`.
 * Signed presets (default) require a server-side signature that includes `upload_preset`.
 */
const CLOUDINARY_PRESET_UNSIGNED = process.env.CLOUDINARY_PRESET_UNSIGNED === 'true';

if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
  console.warn('Cloudinary credentials not configured');
}

interface UploadOptions {
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  folder?: string;
  public_id?: string;
  tags?: string[];
}

export type CloudinaryUploadResult = {
  url: string;
  publicId: string;
  cloudinaryId: string;
  width?: number;
  height?: number;
  format?: string;
  resourceType: 'image' | 'raw';
  bytes?: number;
};

/** Cloudinary: SHA-1 hex digest of sorted `key=value` pairs concatenated with API secret (no separator). */
function cloudinaryApiSign(params: Record<string, string | number>, apiSecret: string): string {
  const pairs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => [k, String(v)] as [string, string])
    .sort(([a], [b]) => a.localeCompare(b));
  const toSign = pairs.map(([k, v]) => `${k}=${v}`).join('&');
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
}

function cloudinaryErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: { message?: string } } | undefined;
    const msg = data?.error?.message;
    const headerErr =
      typeof error.response?.headers?.['x-cld-error'] === 'string'
        ? error.response.headers['x-cld-error']
        : undefined;
    if (msg) return msg;
    if (headerErr) return headerErr;
    if (error.response?.status) return `Cloudinary HTTP ${error.response.status}`;
  }
  if (error instanceof Error) return error.message;
  return 'Unknown Cloudinary error';
}

/**
 * Uploads via the `Donation` preset (or `CLOUDINARY_UPLOAD_PRESET`).
 * - **Signed preset** (default): sends `upload_preset` + `api_key` + `timestamp` + `signature`.
 * - **Unsigned preset**: set `CLOUDINARY_PRESET_UNSIGNED=true` (preset name only + file).
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  filename: string,
  options: UploadOptions = {}
): Promise<CloudinaryUploadResult> {
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary credentials not configured');
  }

  const resource = options.resource_type === 'raw' ? 'raw' : 'image';
  const formData = new FormData();

  if (typeof file === 'string') {
    formData.append('file', file);
  } else {
    formData.append('file', new Blob([new Uint8Array(file)]), filename);
  }

  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  if (CLOUDINARY_PRESET_UNSIGNED) {
    // Unsigned preset: do not send signature.
  } else {
    const timestamp = Math.round(Date.now() / 1000);
    const signParams: Record<string, string | number> = {
      timestamp,
      upload_preset: CLOUDINARY_UPLOAD_PRESET,
    };
    if (options.folder) signParams.folder = options.folder;
    if (options.tags?.length) signParams.tags = options.tags.join(',');
    if (options.public_id) signParams.public_id = options.public_id;

    const signature = cloudinaryApiSign(signParams, CLOUDINARY_API_SECRET);
    formData.append('api_key', CLOUDINARY_API_KEY);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
  }

  if (options.folder) {
    formData.append('folder', options.folder);
  }
  if (options.public_id) {
    formData.append('public_id', options.public_id);
  }
  if (options.tags && options.tags.length) {
    formData.append('tags', options.tags.join(','));
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resource}/upload`;

  try {
    const response = await axios.post(uploadUrl, formData);

    const d = response.data;
    return {
      url: d.secure_url,
      publicId: d.public_id,
      cloudinaryId: d.public_id,
      width: d.width,
      height: d.height,
      format: d.format,
      resourceType: resource === 'raw' ? 'raw' : 'image',
      bytes: d.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', cloudinaryErrorMessage(error));
    const detail = cloudinaryErrorMessage(error);
    if (/invalid signature|signature/i.test(detail)) {
      throw new Error(
        `${detail} — Check API secret and that preset name "${CLOUDINARY_UPLOAD_PRESET}" matches Cloudinary exactly.`
      );
    }
    if (/preset/i.test(detail)) {
      throw new Error(
        `${detail} — Preset "${CLOUDINARY_UPLOAD_PRESET}". If it is unsigned, set CLOUDINARY_PRESET_UNSIGNED=true in .env.`
      );
    }
    throw new Error(detail || 'Failed to upload file to Cloudinary');
  }
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary credentials not configured');
  }

  try {
    console.log(`Would delete: ${publicId}`);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file from Cloudinary');
  }
}

export function getCloudinaryUrl(publicId: string, options?: Record<string, string | number>): string {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary cloud name not configured');
  }

  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const transformations = Object.entries(options || {})
    .map(([key, value]) => `${key}_${value}`)
    .join(',');

  return transformations
    ? `${baseUrl}/${transformations}/${publicId}`
    : `${baseUrl}/${publicId}`;
}
