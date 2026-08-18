import cloudinary from '../config/cloudinary.js';

export const uploadToCloudinary = (fileBuffer, originalName, mimeType) => {
  return new Promise((resolve, reject) => {
    let resource_type = 'raw';
    if (mimeType.startsWith('image/')) resource_type = 'image';
    if (mimeType.startsWith('video/')) resource_type = 'video';

    const cleanName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'teamflow_uploads',
        resource_type,
        public_id: `${Date.now()}_${cleanName}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};