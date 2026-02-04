/**
 * MySQL API Client
 * Replaces Supabase client with REST API calls
 */

// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://your-api-domain.com/api';

// Storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const PROFILE_KEY = 'auth_profile';
const ROLES_KEY = 'auth_roles';

/**
 * Get stored auth token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set auth token
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Clear auth data
 */
export const clearAuth = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(ROLES_KEY);
};

/**
 * HTTP Client with auth
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  
  return data;
}

/**
 * Auth API
 */
/**
 * OTP API
 */
export const otpApi = {
  async sendOTP(phone: string) {
    return apiRequest<{
      success: boolean;
      message: string;
      dev_otp?: string; // Only in development
    }>('/otp.php?action=send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },
  
  async verifyOTP(data: {
    phone: string;
    otp: string;
    full_name: string;
    email: string;
    password: string;
  }) {
    const result = await apiRequest<{
      success: boolean;
      message: string;
      token: string;
      user: { id: number; email: string; phone: string };
      profile: any;
      roles: string[];
    }>('/otp.php?action=verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (result.success && result.token) {
      setToken(result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(result.profile));
      localStorage.setItem(ROLES_KEY, JSON.stringify(result.roles));
    }
    
    return result;
  },
  
  async resendOTP(phone: string) {
    return apiRequest<{
      success: boolean;
      message: string;
      dev_otp?: string;
    }>('/otp.php?action=resend', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },
};

/**
 * Auth API
 */
export const authApi = {
  async signIn(identifier: string, password: string) {
    const result = await apiRequest<{
      success: boolean;
      token: string;
      user: { id: number; email: string; phone: string };
      profile: any;
      roles: string[];
    }>('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    
    if (result.success && result.token) {
      setToken(result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(result.profile));
      localStorage.setItem(ROLES_KEY, JSON.stringify(result.roles));
    }
    
    return result;
  },
  
  async signOut() {
    try {
      await apiRequest('/auth.php?action=logout', { method: 'POST' });
    } catch {
      // Ignore errors on logout
    }
    clearAuth();
  },
  
  async getMe() {
    return apiRequest<{
      user: { id: number; email: string; phone: string };
      profile: any;
      roles: string[];
      is_admin: boolean;
      is_teacher: boolean;
    }>('/auth.php?action=me');
  },
  
  async forgotPassword(email: string) {
    return apiRequest<{ success: boolean; message: string }>('/auth.php?action=forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  
  async resetPassword(token: string, password: string) {
    return apiRequest<{ success: boolean; message: string }>('/auth.php?action=reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
  
  getStoredUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  
  getStoredProfile() {
    const profile = localStorage.getItem(PROFILE_KEY);
    return profile ? JSON.parse(profile) : null;
  },
  
  getStoredRoles() {
    const roles = localStorage.getItem(ROLES_KEY);
    return roles ? JSON.parse(roles) : [];
  },
  
  isAuthenticated() {
    return !!getToken();
  },
};

/**
 * Courses API
 */
export const coursesApi = {
  async list(params?: {
    category_id?: number;
    featured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.category_id) query.set('category_id', String(params.category_id));
    if (params?.featured) query.set('featured', '1');
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    
    const endpoint = `/courses.php${query.toString() ? '?' + query.toString() : ''}`;
    return apiRequest<{ data: any[]; pagination: any }>(endpoint);
  },
  
  async getById(id: number) {
    return apiRequest<any>(`/courses.php?id=${id}`);
  },
  
  async getBySlug(slug: string) {
    return apiRequest<any>(`/courses.php?slug=${slug}`);
  },
  
  async create(data: any) {
    return apiRequest<{ success: boolean; data: any }>('/courses.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async update(id: number, data: any) {
    return apiRequest<{ success: boolean; data: any }>(`/courses.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  async delete(id: number) {
    return apiRequest<{ success: boolean }>(`/courses.php?id=${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Categories API
 */
export const categoriesApi = {
  async list() {
    return apiRequest<{ data: any[] }>('/categories.php');
  },
  
  async getBySlug(slug: string) {
    return apiRequest<any>(`/categories.php?slug=${slug}`);
  },
};

/**
 * Teachers API
 */
export const teachersApi = {
  async list() {
    return apiRequest<{ data: any[] }>('/teachers.php');
  },
  
  async getById(id: number) {
    return apiRequest<any>(`/teachers.php?id=${id}`);
  },
};

/**
 * Enrollments API
 */
export const enrollmentsApi = {
  async list() {
    return apiRequest<{ data: any[] }>('/enrollments.php');
  },
  
  async check(courseId: number) {
    return apiRequest<{ enrolled: boolean }>(`/enrollments.php?action=check&course_id=${courseId}`);
  },
};

/**
 * Payments API
 */
export const paymentsApi = {
  async list() {
    return apiRequest<{ data: any[] }>('/payments.php');
  },
  
  async processManual(data: {
    course_id: number;
    amount: number;
    payment_method: string;
    transaction_id: string;
    phone_number: string;
    billing_info?: any;
  }) {
    return apiRequest<{ success: boolean; payment_id: number; message: string }>('/payments.php?action=process', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async initiateBkash(data: {
    course_id: number;
    amount: number;
    phone_number: string;
    billing_info?: any;
  }) {
    return apiRequest<{ success: boolean; bkashURL: string; paymentID: string }>('/payments.php?action=bkash', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  async verify(paymentId: number, action: 'approve' | 'reject') {
    return apiRequest<{ success: boolean; message: string }>('/payments.php?action=verify', {
      method: 'POST',
      body: JSON.stringify({ payment_id: paymentId, action }),
    });
  },
};

/**
 * Testimonials API
 */
export const testimonialsApi = {
  async featured() {
    return apiRequest<{ data: any[] }>('/testimonials.php?featured=1');
  },
  
  async byCourse(courseId: number) {
    return apiRequest<{ data: any[] }>(`/testimonials.php?course_id=${courseId}`);
  },
};

/**
 * Notifications API
 */
export const notificationsApi = {
  async list() {
    return apiRequest<{ data: any[] }>('/notifications.php');
  },
  
  async markAsRead(id: number) {
    return apiRequest<{ success: boolean }>(`/notifications.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_read: true }),
    });
  },
};

/**
 * Lessons API
 */
export const lessonsApi = {
  async getByCourse(courseId: number) {
    return apiRequest<{ data: any[] }>(`/lessons.php?course_id=${courseId}`);
  },
  
  async getById(id: number) {
    return apiRequest<any>(`/lessons.php?id=${id}`);
  },
  
  async updateProgress(lessonId: number, data: { is_completed?: boolean; watch_time_seconds?: number }) {
    return apiRequest<{ success: boolean }>(`/lessons.php?action=progress&lesson_id=${lessonId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Profiles API
 */
export const profilesApi = {
  async get() {
    return apiRequest<any>('/profiles.php');
  },
  
  async update(data: { full_name?: string; phone?: string; avatar_url?: string }) {
    return apiRequest<{ success: boolean; data: any }>('/profiles.php', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Export default API object
const api = {
  auth: authApi,
  otp: otpApi,
  courses: coursesApi,
  categories: categoriesApi,
  teachers: teachersApi,
  enrollments: enrollmentsApi,
  payments: paymentsApi,
  testimonials: testimonialsApi,
  notifications: notificationsApi,
  lessons: lessonsApi,
  profiles: profilesApi,
};

export default api;
