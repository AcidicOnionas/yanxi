"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, ROLES, DB_TABLES } from './supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { isUserTeacher, setUserRole } from './db-setup';

type UserRole = 'student' | 'teacher' | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  setTeacherRole: (userId: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  deleteAccount: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(null);

  // Function to check user role from the database
  const checkUserRole = async (userId: string) => {
    try {
      if (!userId) {
        setRole(null);
        return;
      }

      const isTeacher = await isUserTeacher(userId);
      setRole(isTeacher ? 'teacher' : 'student');
    } catch (error) {
      console.error('Error checking user role:', error);
      // Default to student if there's an error
      setRole('student');
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check user role from the database
      if (session?.user) {
        checkUserRole(session.user.id);
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
      
      // Check user role from the database
      if (session?.user) {
        checkUserRole(session.user.id);
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to set a user as a teacher
  const setTeacherRole = async (userId: string) => {
    try {
      const { success, error } = await setUserRole(userId, ROLES.TEACHER);
      
      if (error) {
        return { error };
      }
      
      // If setting the current user as teacher, update the role state
      if (user && user.id === userId) {
        setRole('teacher');
      }
      
      toast.success('Teacher role assigned successfully');
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Standard sign in for all users
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
      
      // Check user role from database
      await checkUserRole(data.user.id);
      
      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      
      if (error) {
        setLoading(false);
        return { error };
      }
      
      // Set role to student for new sign-ups (in the database)
      if (data?.user) {
        await setUserRole(data.user.id, ROLES.STUDENT);
        setRole('student');
      }
      
      setLoading(false);
      return { error: null };
    } catch (error) {
      setLoading(false);
      return { error };
    }
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
    setTeacherRole,
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