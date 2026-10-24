import User from '../models/User.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

export const syncUserProfile = async (req, res, next) => {
  try {
    const { name, username, email, profilePicture } = req.body;
    const firebaseUid = req.firebaseUser.uid;

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // Check for duplicate unique fields before creating
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already registered.' });
      }

      const existingUsername = await User.findOne({ username: username.toLowerCase() });
      if (existingUsername) {
        return res.status(400).json({ success: false, message: 'Username is already taken.' });
      }

      user = await User.create({
        firebaseUid,
        name,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        profilePicture: profilePicture || '',
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUserProfile = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, statusMessage } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (statusMessage !== undefined) user.statusMessage = statusMessage;

    // Multipart bodies arrive as strings, so the flag is the string 'true'
    if (req.body.removePicture === 'true' || req.body.removePicture === true) {
      user.profilePicture = '';
    }

    // If an image file was attached, upload it to Cloudinary
    if (req.file) {
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ success: false, message: 'Profile picture must be an image' });
      }
      const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname, req.file.mimetype);
      user.profilePicture = uploadResult.url;
    }

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};