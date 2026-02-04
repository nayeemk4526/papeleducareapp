import { authApi } from "@/lib/mysql-api";
import { z } from "zod";

// Validation schemas
export const signUpSchema = z.object({
  fullName: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  email: z.string().email("সঠিক ইমেইল দিন"),
  phone: z.string().min(11, "সঠিক ফোন নম্বর দিন").max(14, "সঠিক ফোন নম্বর দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "পাসওয়ার্ড মিলছে না",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().min(1, "ইমেইল বা ফোন নম্বর দিন"),
  password: z.string().min(1, "পাসওয়ার্ড দিন"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;

// Sign in function (for MySQL)
export const signIn = async (data: SignInFormData) => {
  const result = await authApi.signIn(data.email, data.password);
  
  if (!result.success) {
    throw new Error("ইমেইল/ফোন বা পাসওয়ার্ড ভুল");
  }

  return result;
};

// Sign out function
export const signOut = async () => {
  await authApi.signOut();
};

// Check if user is admin
export const checkIsAdmin = async (userId: number): Promise<boolean> => {
  const roles = authApi.getStoredRoles();
  return roles.includes('admin');
};

// Check if user is teacher
export const checkIsTeacher = async (userId: number): Promise<boolean> => {
  const roles = authApi.getStoredRoles();
  return roles.includes('teacher');
};

// Get user profile
export const getUserProfile = async (userId: number) => {
  return authApi.getStoredProfile();
};

// Get user roles
export const getUserRoles = async (userId: number) => {
  return authApi.getStoredRoles();
};
