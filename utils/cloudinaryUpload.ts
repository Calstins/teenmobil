// utils/cloudinaryUpload.ts
const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'calstech';
const UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'estate';

/**
 * Upload image directly to Cloudinary
 * @param imageUri - Local file URI from ImagePicker
 * @returns Cloudinary secure URL
 */
export const uploadImageToCloudinary = async (
  imageUri: string
): Promise<string> => {
  try {
    // Validate URI
    if (!imageUri) {
      throw new Error('No image URI provided');
    }

    console.log('📤 Starting upload to Cloudinary...');
    console.log('Image URI:', imageUri);

    // Create form data
    const formData = new FormData();

    // Extract filename from URI
    const uriParts = imageUri.split('/');
    const filename = uriParts[uriParts.length - 1] || `photo_${Date.now()}.jpg`;

    // Append image file - React Native handles this automatically!
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    } as any);

    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'teenshapers/profiles');

    console.log('Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('Upload Preset:', UPLOAD_PRESET);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Cloudinary error:', data);
      throw new Error(data.error?.message || 'Upload failed');
    }

    console.log('✅ Upload successful!');
    console.log('URL:', data.secure_url);

    return data.secure_url;
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    throw new Error(error.message || 'Failed to upload image');
  }
};

/**
 * Upload with progress tracking using XMLHttpRequest
 * @param imageUri - Local file URI from ImagePicker
 * @param onProgress - Progress callback (0-100)
 * @returns Cloudinary secure URL
 */
export const uploadImageWithProgress = async (
  imageUri: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      // Extract filename
      const uriParts = imageUri.split('/');
      const filename =
        uriParts[uriParts.length - 1] || `photo_${Date.now()}.jpg`;

      // Append file
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
      } as any);

      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'teenshapers/profiles');

      xhr.open(
        'POST',
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
      );

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          onProgress(percentComplete);
          console.log(`📤 Upload progress: ${percentComplete}%`);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log('✅ Upload successful!');
          console.log('URL:', data.secure_url);
          resolve(data.secure_url);
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            console.error('❌ Upload failed:', errorData);
            reject(new Error(errorData.error?.message || 'Upload failed'));
          } catch {
            reject(new Error('Upload failed'));
          }
        }
      };

      xhr.onerror = () => {
        console.error('❌ Network error');
        reject(new Error('Network error during upload'));
      };

      xhr.ontimeout = () => {
        console.error('❌ Upload timeout');
        reject(new Error('Upload timeout'));
      };

      console.log('📤 Starting upload with progress tracking...');
      xhr.send(formData);
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      reject(new Error(error.message || 'Failed to upload image'));
    }
  });
};
