import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../lib/api';
import type { AuthAccount, UserProfile } from '../types';

interface AuthContextType {
  account: AuthAccount | null;
  currentProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  switchProfile: (profileId: string) => void;
  error: string | null;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  phone?: string;
  password: string;
  profile: {
    type: 'student' | 'parent' | 'teacher' | 'adult' | 'admin';
    firstName: string;
    lastName: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AuthAccount | null>(null);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          // Try to get user profiles to verify token is still valid
          const profiles = await apiClient.getProfiles();
          if (profiles.length > 0) {
            const accountData: AuthAccount = {
              id: 'current-account', // We'll get this from the token
              email: '', // We'll get this from the token
              phone: '',
              profiles: profiles,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            setAccount(accountData);
            setCurrentProfile(profiles[0]); // Set first profile as default
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear invalid token
        apiClient.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen for token expiration events
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('🔓 Token expired event received, logging out');
      setAccount(null);
      setCurrentProfile(null);
      setError('Your session has expired. Please log in again.');
    };

    window.addEventListener('auth-token-expired', handleTokenExpired);
    return () => window.removeEventListener('auth-token-expired', handleTokenExpired);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Attempting real API login for:', email);
      
      const result = await apiClient.login(email, password);
      console.log('API login successful:', result);
      setAccount(result.account);
      setCurrentProfile(result.account.profiles[0] || null);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await apiClient.register(userData);
      setAccount(result.account);
      setCurrentProfile(result.account.profiles[0] || null);
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setAccount(null);
    setCurrentProfile(null);
    setError(null);
  };

  const switchProfile = (profileId: string) => {
    const profile = account?.profiles.find(p => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    account,
    currentProfile,
    isAuthenticated: !!account,
    isLoading,
    login,
    register,
    logout,
    switchProfile,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;