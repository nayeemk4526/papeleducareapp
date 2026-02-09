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
  email: z.string().min(1, "ইমেইল বা ফোন নম্বর দিন"),
  password: z.string().min(1, "পাসওয়ার্ড দিন"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;

// Sign up function
export const signUp = async (data: SignUpFormData) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: data.fullName,
        phone: data.phone,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      throw new Error("এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট তৈরি করা হয়েছে");
    }
    throw new Error(error.message);
  }

  return authData;
};

// Sign in function
export const signIn = async (data: SignInFormData) => {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      throw new Error("ইমেইল বা পাসওয়ার্ড ভুল");
    }
    throw new Error(error.message);
  }

  return authData;
};

// Sign out function
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

// Check if user is admin
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'admin'
  });
  
  if (error) return false;
  return data as boolean;
};

// Check if user is teacher
export const checkIsTeacher = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: 'teacher'
  });
  
  if (error) return false;
  return data as boolean;
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) throw new Error(error.message);
  return data;
};

// Get user roles
export const getUserRoles = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  
  if (error) throw new Error(error.message);
  return data?.map(r => r.role) || [];
};
