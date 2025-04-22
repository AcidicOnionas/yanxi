import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = "https://acvfkkpypmkkoyhgxxmx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjdmZra3B5cG1ra295aGd4eG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NzMzNjcsImV4cCI6MjA2MDA0OTM2N30.4cn6EdJKOzwYn258WyWQEzQFWnxxEYmW3wfvcRlkBEQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Teacher account hardcoded credentials (not stored in the database)
export const TEACHER_CREDENTIALS = {
  email: 'chriscao0329@gmail.com',
  password: 'teacherPassword123',
}; 