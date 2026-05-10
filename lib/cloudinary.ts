import axios from 'axios';

const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;

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

  formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload');
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

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
    const response = await axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

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
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file to Cloudinary');
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
