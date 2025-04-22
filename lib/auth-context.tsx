"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, TEACHER_CREDENTIALS } from './supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

type UserRole = 'student' | 'teacher' | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createTeacherAccount: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  deleteAccount: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if user is the teacher
      if (session?.user?.email === TEACHER_CREDENTIALS.email) {
        setRole('teacher');
      } else if (session?.user) {
        setRole('student');
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if user is the teacher
      if (session?.user?.email === TEACHER_CREDENTIALS.email) {
        setRole('teacher');
      } else if (session?.user) {
        setRole('student');
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to create the teacher account
  const createTeacherAccount = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: TEACHER_CREDENTIALS.email,
        password: TEACHER_CREDENTIALS.password,
      });
      
      if (error) {
        return { error };
      }
      
      toast.success('Teacher account created successfully');
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    // Check if trying to sign in as teacher
    if (email === TEACHER_CREDENTIALS.email && password === TEACHER_CREDENTIALS.password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // If login fails, show a more helpful message for teacher account
        if (error.message.includes('Invalid')) {
          setLoading(false);
          return { 
            error: new Error('Teacher account not found. Please create it first using the "Create Teacher Account" button.') 
          };
        }
        
        setLoading(false);
        return { error };
      }
      
      setRole('teacher');
      setLoading(false);
      return { error: null };
    }
    
    // Otherwise, try normal sign in (student)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setLoading(false);
      return { error };
    }
    
    // Check if email is confirmed
    if (data?.user && !data.user.email_confirmed_at) {
      setLoading(false);
      return { 
        error: new Error('Please verify your email before logging in. Check your inbox for a verification link.') 
      };
    }
    
    setRole('student');
    setLoading(false);
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Don't allow signing up with teacher email through normal signup
    if (email === TEACHER_CREDENTIALS.email) {
      return { error: new Error('This email is reserved for teachers. Use the teacher login instead.') };
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    
    if (!error) {
      // Set role to student for new sign-ups
      setRole('student');
    }
    
    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setRole(null);
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const deleteAccount = async () => {
    try {
      // First make sure we're not trying to delete the teacher account
      if (user?.email === TEACHER_CREDENTIALS.email) {
        return { error: new Error('Cannot delete the teacher account') };
      }

      // Call our API endpoint to delete the account
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Handle API response
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Error deleting account:', result.error);
        return { error: new Error(result.error || 'Failed to delete account') };
      }
      
      // If there was a warning but still success, log it
      if (result.warning) {
        console.warn('Warning during account deletion:', result.warning);
      }

      // Sign out after successful deletion
      await signOut();
      return { error: null };
    } catch (error) {
      console.error('Error in deleteAccount:', error);
      return { error };
    }
  };

  const value = {
    session,
    user,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    createTeacherAccount,
    resetPassword,
    deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 