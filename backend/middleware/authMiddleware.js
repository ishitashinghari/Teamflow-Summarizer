import admin from '../config/firebase.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing Bearer Token',
    });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid } = decodedToken;

    const user = await User.findOne({ firebaseUid: uid });
    
    // FIX: Allow the request to pass through if the user is explicitly trying to sync/register
    // Otherwise, block them if they don't have a MongoDB record.
    if (!user && !req.originalUrl.includes('/sync')) {
      return res.status(404).json({
        success: false,
        message: 'Authenticated User Record Not Found in MongoDB. Sync required.',
      });
    }

    req.user = user;
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('[Token Verification Failed]:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token validation failed',
    });
  }
};