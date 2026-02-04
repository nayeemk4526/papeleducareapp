import React, { createContext, useContext } from 'react';
import { useMySQLAuth } from '@/hooks/useMySQLAuth';

interface User {
  id: number;
  email: string;
  phone: string;
}

interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  roles: string[];
  isLoading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  signIn: (identifier: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  sendOTP: (phone: string) => Promise<any>;
  verifyOTPAndRegister: (data: {
    phone: string;
    otp: string;
    full_name: string;
    email: string;
    password: string;
  }) => Promise<any>;
  resendOTP: (phone: string) => Promise<any>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useMySQLAuth();

  const value: AuthContextType = {
    user: auth.user,
    profile: auth.profile,
    roles: auth.roles,
    isLoading: auth.isLoading,
    isAdmin: auth.isAdmin,
    isTeacher: auth.isTeacher,
    signIn: auth.signIn,
    signOut: auth.signOut,
    sendOTP: auth.sendOTP,
    verifyOTPAndRegister: auth.verifyOTPAndRegister,
    resendOTP: auth.resendOTP,
    refreshProfile: auth.refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
