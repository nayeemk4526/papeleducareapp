import { supabase } from "@/integrations/supabase/client";
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
  email: z.string().min(1, "ইমেইল দিন"),
  password: z.string().min(1, "পাসওয়ার্ড দিন"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;

// Sign in function
export const signIn = async (data: SignInFormData) => {
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  
  if (error) {
    throw new Error("ইমেইল বা পাসওয়ার্ড ভুল");
  }
};

// Sign out function
export const signOut = async () => {
  await supabase.auth.signOut();
};

// Check if user is admin
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
  return !!data;
};

// Check if user is teacher
export const checkIsTeacher = async (userId: string): Promise<boolean> => {
  const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'teacher' });
  return !!data;
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
};

// Get user roles
export const getUserRoles = async (userId: string) => {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  return data?.map(r => r.role) || [];
};
