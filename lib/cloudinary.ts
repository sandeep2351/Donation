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

export async function uploadToCloudinary(
  file: Buffer | string,
  filename: string,
  options: UploadOptions = {}
): Promise<any> {
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary credentials not configured');
  }

  const formData = new FormData();
  
  // Handle both buffer and string (base64)
  if (typeof file === 'string') {
    formData.append('file', file);
  } else {
    formData.append('file', new Blob([file]), filename);
  }

  formData.append('upload_preset', 'unsigned_upload'); // Use unsigned upload for this demo
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

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      url: response.data.secure_url,
      publicId: response.data.public_id,
      cloudinaryId: response.data.public_id,
      width: response.data.width,
      height: response.data.height,
      format: response.data.format,
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
    // For unsigned uploads, deletion might not be available
    // This is a placeholder for signed deletion
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
