import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  updatePassword as firebaseUpdatePassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserProfile } from '../types';
import { profileService } from '../services/profileService';

export interface ExtendedUser extends FirebaseUser {
  id: string; // Alias for uid for backward compatibility with existing ENERO components
}

interface AuthContextType {
  user: ExtendedUser | null;
  profile: UserProfile | null;
  session: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLiveMode: boolean;
  isDemoMode: boolean;
  unverifiedEmail: string | null;
  clearUnverifiedEmail: () => void;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  verifySimulatedEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function formatFirebaseError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please log in.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/weak-password':
      return 'Please choose a stronger password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection.';
    default:
      return error.message && !error.message.includes('Firebase:')
        ? error.message
        : 'Authentication failed. Please verify your details and try again.';
  }
}

function adaptFirebaseUser(user: FirebaseUser | null): ExtendedUser | null {
  if (!user) return null;
  const extended = user as ExtendedUser;
  // Ensure .id matches .uid for legacy callers
  if (!extended.id) {
    Object.defineProperty(extended, 'id', {
      value: user.uid,
      writable: true,
      enumerable: true,
    });
  }
  return extended;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  // Central Firebase Authentication Listener (onAuthStateChanged)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const extUser = adaptFirebaseUser(firebaseUser);
        setUser(extUser);
        setIsDemoMode(false);

        // Fetch or create user profile associated with Firebase UID
        const userProf = profileService.getProfile(
          firebaseUser.uid,
          firebaseUser.email || '',
          firebaseUser.displayName || ''
        );
        setProfile(userProf);

        // Check verification status
        if (!firebaseUser.emailVerified && firebaseUser.email) {
          // If signed up via email/password and unverified
          // Note: OAuth providers typically have emailVerified = true
          // Keep unverifiedEmail if needed or let existing session flow continue
        }
      } else {
        // Check if demo user session exists
        const demoSessionKey = localStorage.getItem('enero_demo_session_active');
        if (demoSessionKey === 'true') {
          const demoProfile = profileService.getProfile('demo-user-vedant');
          const mockUser = {
            uid: 'demo-user-vedant',
            id: 'demo-user-vedant',
            email: 'vedant@example.com',
            displayName: 'Vedant Deshmukh',
            emailVerified: true,
          } as unknown as ExtendedUser;
          setUser(mockUser);
          setProfile(demoProfile);
          setIsDemoMode(true);
        } else {
          setUser(null);
          setProfile(null);
          setIsDemoMode(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign Up with Firebase Authentication
  const signUp = async (email: string, password: string, fullName: string) => {
    // 1. Password policy validation: min 8 chars, 1 number, 1 uppercase
    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }
    if (!/[0-9]/.test(password)) {
      return { success: false, error: 'Password must contain at least one number.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { success: false, error: 'Password must contain at least one uppercase letter.' };
    }

    try {
      // 1. Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const createdUser = userCredential.user;

      // 2. Set display name in Firebase profile
      try {
        await firebaseUpdateProfile(createdUser, {
          displayName: fullName.trim(),
        });
      } catch (err) {
        console.warn('Could not update Firebase displayName:', err);
      }

      // 3. Send email verification
      try {
        await sendEmailVerification(createdUser);
      } catch (err) {
        console.warn('Could not send verification email:', err);
      }

      // 4. Create the user's ENERO profile associated with Firebase UID
      const newProfile = profileService.getProfile(createdUser.uid, email.trim(), fullName.trim());
      newProfile.fullName = fullName.trim();
      profileService.saveProfile(newProfile);

      setProfile(newProfile);
      setUnverifiedEmail(email.trim());

      return { success: true, requiresVerification: true };
    } catch (err: any) {
      return { success: false, error: formatFirebaseError(err) };
    }
  };

  // Sign In with Firebase Authentication
  const signIn = async (email: string, password: string) => {
    try {
      localStorage.removeItem('enero_demo_session_active');
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const signedInUser = userCredential.user;

      const extUser = adaptFirebaseUser(signedInUser);
      setUser(extUser);
      setIsDemoMode(false);

      const userProf = profileService.getProfile(
        signedInUser.uid,
        signedInUser.email || '',
        signedInUser.displayName || ''
      );
      setProfile(userProf);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatFirebaseError(err) };
    }
  };

  // Sign In with Google OAuth via Firebase
  const signInWithGoogle = async () => {
    try {
      localStorage.removeItem('enero_demo_session_active');
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const googleUser = userCredential.user;

      const extUser = adaptFirebaseUser(googleUser);
      setUser(extUser);
      setIsDemoMode(false);

      const userProf = profileService.getProfile(
        googleUser.uid,
        googleUser.email || '',
        googleUser.displayName || 'Google User'
      );
      setProfile(userProf);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: formatFirebaseError(err) };
    }
  };

  // Demo Account ("Vedant Deshmukh" preview)
  const signInWithDemo = async () => {
    localStorage.setItem('enero_demo_session_active', 'true');
    const demoProfile = profileService.getProfile('demo-user-vedant');
    const mockUser = {
      uid: 'demo-user-vedant',
      id: 'demo-user-vedant',
      email: 'vedant@example.com',
      displayName: 'Vedant Deshmukh',
      emailVerified: true,
    } as unknown as ExtendedUser;

    setUser(mockUser);
    setProfile(demoProfile);
    setIsDemoMode(true);
  };

  // Sign Out with Firebase Authentication
  const signOut = async () => {
    try {
      localStorage.removeItem('enero_demo_session_active');
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase sign-out error:', err);
    }
    setUser(null);
    setProfile(null);
    setIsDemoMode(false);
    setUnverifiedEmail(null);
  };

  // Reset Password Request via Firebase
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      // Return success or mapped error to prevent email enumeration or show network error
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
        return { success: true };
      }
      return { success: false, error: formatFirebaseError(err) };
    }
  };

  // Update Password
  const updatePassword = async (newPassword: string) => {
    if (newPassword.length < 8 || !/[0-9]/.test(newPassword) || !/[A-Z]/.test(newPassword)) {
      return { success: false, error: 'Password must have at least 8 characters, one number, and one uppercase letter.' };
    }

    if (auth.currentUser) {
      try {
        await firebaseUpdatePassword(auth.currentUser, newPassword);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: formatFirebaseError(err) };
      }
    } else {
      return { success: true };
    }
  };

  // Update User Profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return { success: false, error: 'Not authenticated' };

    const updatedProfile = profileService.updateProfile(user.uid, updates);
    setProfile(updatedProfile);

    // If fullName changed, also sync Firebase displayName
    if (updates.fullName && auth.currentUser) {
      try {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: updates.fullName.trim(),
        });
      } catch (err) {
        console.warn('Could not update Firebase displayName:', err);
      }
    }

    return { success: true };
  };

  // Resend Email Verification via Firebase
  const resendVerificationEmail = async (_email: string) => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        return true;
      } catch (err) {
        console.warn('Error resending Firebase verification email:', err);
        return true; // Still show success toast for UX
      }
    }
    return true;
  };

  // Continue after user verifies email
  const verifySimulatedEmail = async (_email: string) => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
      } catch {}
    }
    setUnverifiedEmail(null);
  };

  const clearUnverifiedEmail = () => {
    setUnverifiedEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session: user,
        loading,
        isAuthenticated: Boolean(user),
        isLiveMode: true, // Connected to live Firebase Authentication
        isDemoMode,
        unverifiedEmail,
        clearUnverifiedEmail,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithDemo,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        resendVerificationEmail,
        verifySimulatedEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
