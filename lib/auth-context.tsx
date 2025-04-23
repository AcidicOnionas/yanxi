"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { getUserRole, setUserRole, isTeacher } from './role-service';
import { UserRole as DatabaseUserRole } from './database.types';

type UserRole = 'student' | 'teacher' | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  deleteAccount: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(null);

  // Helper function to fetch and set user role
  const fetchAndSetUserRole = async (userId: string) => {
    if (!userId) {
      setRole(null);
      return;
    }
    
    try {
      const userRole = await getUserRole(userId);
      setRole(userRole);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('student'); // Default to student on error
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check user role if logged in
      if (session?.user) {
        fetchAndSetUserRole(session.user.id);
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
      
      // Check user role if logged in
      if (session?.user) {
        fetchAndSetUserRole(session.user.id);
      } else {
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    // Try to sign in
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
    
    // Fetch role from database
    if (data?.user) {
      await fetchAndSetUserRole(data.user.id);
    }
    
    setLoading(false);
    return { error: null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
    
    if (!error && data?.user) {
      // Set role to student for new sign-ups
      await setUserRole(data.user.id, 'student');
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