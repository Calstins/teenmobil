// utils/imageConverter.ts
import * as FileSystem from 'expo-file-system';

export const convertImageToBase64 = async (uri: string): Promise<string | null> => {
  try {
    // Validate URI
    if (!uri || !uri.startsWith('file://')) {
      console.error('Invalid image URI:', uri);
      return null;
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Add data URL prefix
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

/**
 * Get file size in MB
 * @param uri - Local file URI
 * @returns File size in MB
 */
export const getFileSizeInMB = async (uri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists && 'size' in fileInfo) {
      return fileInfo.size / (1024 * 1024); // Convert to MB
    }
    return 0;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};

/**
 * Compress image if needed
 * @param uri - Local file URI
 * @param maxSizeMB - Maximum size in MB
 * @returns Compressed base64 string or null
 */
export const compressAndConvert = async (
  uri: string,
  maxSizeMB: number = 2
): Promise<string | null> => {
  try {
    const sizeInMB = await getFileSizeInMB(uri);
    
    if (sizeInMB > maxSizeMB) {
      console.warn(`Image size (${sizeInMB.toFixed(2)}MB) exceeds ${maxSizeMB}MB. Consider reducing quality in ImagePicker.`);
    }

    return await convertImageToBase64(uri);
  } catch (error) {
    console.error('Error compressing image:', error);
    return null;
  }
};