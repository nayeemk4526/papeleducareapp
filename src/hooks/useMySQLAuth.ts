/**
 * MySQL Auth Hook
 * Custom hook for authentication with MySQL backend
 */

import { useState, useEffect, useCallback } from 'react';
import { authApi, otpApi, clearAuth } from '@/lib/mysql-api';

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

interface AuthState {
  user: User | null;
  profile: Profile | null;
  roles: string[];
  isLoading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
}

export const useMySQLAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: authApi.getStoredUser(),
    profile: authApi.getStoredProfile(),
    roles: authApi.getStoredRoles(),
    isLoading: true,
    isAdmin: false,
    isTeacher: false,
  });

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!authApi.isAuthenticated()) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const data = await authApi.getMe();
        setState({
          user: data.user,
          profile: data.profile,
          roles: data.roles,
          isLoading: false,
          isAdmin: data.is_admin,
          isTeacher: data.is_teacher,
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        clearAuth();
        setState({
          user: null,
          profile: null,
          roles: [],
          isLoading: false,
          isAdmin: false,
          isTeacher: false,
        });
      }
    };

    checkAuth();
  }, []);

  // Send OTP for registration
  const sendOTP = useCallback(async (phone: string) => {
    return otpApi.sendOTP(phone);
  }, []);

  // Verify OTP and complete registration
  const verifyOTPAndRegister = useCallback(async (data: {
    phone: string;
    otp: string;
    full_name: string;
    email: string;
    password: string;
  }) => {
    const result = await otpApi.verifyOTP(data);
    
    if (result.success) {
      setState({
        user: result.user,
        profile: result.profile,
        roles: result.roles,
        isLoading: false,
        isAdmin: result.roles.includes('admin'),
        isTeacher: result.roles.includes('teacher'),
      });
    }
    
    return result;
  }, []);

  // Resend OTP
  const resendOTP = useCallback(async (phone: string) => {
    return otpApi.resendOTP(phone);
  }, []);

  // Sign in with email/phone and password
  const signIn = useCallback(async (identifier: string, password: string) => {
    const result = await authApi.signIn(identifier, password);
    
    if (result.success) {
      setState({
        user: result.user,
        profile: result.profile,
        roles: result.roles,
        isLoading: false,
        isAdmin: result.roles.includes('admin'),
        isTeacher: result.roles.includes('teacher'),
      });
    }
    
    return result;
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    await authApi.signOut();
    setState({
      user: null,
      profile: null,
      roles: [],
      isLoading: false,
      isAdmin: false,
      isTeacher: false,
    });
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (!authApi.isAuthenticated()) return;
    
    try {
      const data = await authApi.getMe();
      setState(prev => ({
        ...prev,
        user: data.user,
        profile: data.profile,
        roles: data.roles,
        isAdmin: data.is_admin,
        isTeacher: data.is_teacher,
      }));
    } catch (error) {
      console.error('Profile refresh failed:', error);
    }
  }, []);

  return {
    ...state,
    sendOTP,
    verifyOTPAndRegister,
    resendOTP,
    signIn,
    signOut,
    refreshProfile,
  };
};

export default useMySQLAuth;
