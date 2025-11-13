// utils/cloudinaryUpload.ts
// Direct upload to Cloudinary without base64 conversion
import * as FileSystem from 'expo-file-system';

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'calstech';
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'teenshapers';

/**
 * Upload image directly to Cloudinary
 * @param imageUri - Local file URI from ImagePicker
 * @returns Cloudinary secure URL
 */
export const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
  try {
    // Validate URI
    if (!imageUri || !imageUri.startsWith('file://')) {
      throw new Error('Invalid image URI');
    }

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      throw new Error('Image file not found');
    }

    // Create form data
    const formData = new FormData();
    
    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'profile.jpg';
    
    // Append image file (NO BASE64 - direct file upload)
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    } as any);
    
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'teenshapers/profiles');
    formData.append('public_id', `teen_${Date.now()}`);

    console.log('📤 Uploading to Cloudinary...');
    console.log('Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('Upload Preset:', UPLOAD_PRESET);

    // Upload directly to Cloudinary API
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Cloudinary error:', errorData);
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    
    console.log('✅ Upload successful!');
    console.log('URL:', data.secure_url);
    
    return data.secure_url;
    
  } catch (error: any) {
    console.error('❌ Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

/**
 * Upload image with progress tracking using FileSystem.uploadAsync
 */
export const uploadImageWithProgress = async (
  imageUri: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const uploadResult = await FileSystem.uploadAsync(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        imageUri,
        {
          httpMethod: 'POST',
          fieldName: 'file',
          parameters: {
            upload_preset: UPLOAD_PRESET,
            folder: 'teenshapers',
            public_id: `teen_${Date.now()}`,
          },
        }
      );

      if (uploadResult.status !== 200) {
        throw new Error('Upload failed');
      }

      const data = JSON.parse(uploadResult.body);
      resolve(data.secure_url);
      
    } catch (error: any) {
      reject(error);
    }
  });
};