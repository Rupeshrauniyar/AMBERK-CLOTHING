const cloudinary = require('cloudinary').v2;
const fs = require('fs');

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadImage = async (filePath, folder = 'amberk_clothing') => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder,
        use_filename: true,
        resource_type: 'image',
      });
      // remove local temp file
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      return {
        url: result.secure_url,
        publicId: result.public_id,
        provider: 'cloudinary',
        width: result.width,
        height: result.height,
      };
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local file storage:', err.message);
    }
  }

  // Local storage fallback
  const filename = filePath.split(/[\\/]/).pop();
  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    provider: 'local',
  };
};

module.exports = {
  uploadImage,
};

