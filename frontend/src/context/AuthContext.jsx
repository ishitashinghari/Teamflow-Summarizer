import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from '../services/firebase';
import { userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const registerUser = async (name, username, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Synchronize to MongoDB through Backend
    const syncRes = await userAPI.syncUser({
      name,
      username,
      email,
      profilePicture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });

    setMongoUser(syncRes.data.data);
    return syncRes.data.data;
  };

  const loginUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logoutUser = () => {
    setMongoUser(null);
    return signOut(auth);
  };

  const refreshProfile = async () => {
    try {
      const res = await userAPI.getMe();
      setMongoUser(res.data.data);
    } catch (e) {
      console.error('Failed to sync profile:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const res = await userAPI.getMe();
          setMongoUser(res.data.data);
        } catch (err) {
          console.error('[AuthContext] MongoDB Record sync fail:', err.message);

          try {
            const fallbackName = user.displayName || user.email?.split('@')[0] || 'Workspace User';
            const fallbackUsername = fallbackName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 10000);

            const syncRes = await userAPI.syncUser({
              name: fallbackName,
              username: fallbackUsername,
              email: user.email,
              profilePicture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fallbackName)}`,
            });

            setMongoUser(syncRes.data.data);
          } catch (syncErr) {
            console.error('[AuthContext] Auto-sync failed:', syncErr.message);
          }
        }
      } else {
        setMongoUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        mongoUser,
        loading,
        registerUser,
        loginUser,
        logoutUser,
        refreshProfile,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);