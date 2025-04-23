import { supabase } from './supabase';
import { UserRole } from './database.types';

// Map of user IDs to teacher status (simple in-memory cache)
const teacherCache: Record<string, boolean> = {};

// Debug a role issue
async function debugRoleCheck(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    console.log('DEBUG ROLE CHECK:', { userId, data, error });
    
    // If no data found for the user, check all teacher roles
    if (!data?.length) {
      const { data: allTeachers, error: teacherError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'teacher');
      
      console.log('ALL TEACHERS:', { count: allTeachers?.length, teachers: allTeachers, error: teacherError });
    }
    
    return data;
  } catch (e) {
    console.error('Debug role check failed:', e);
    return null;
  }
}

export const getUserRole = async (userId: string): Promise<UserRole> => {
  try {
    console.log(`Getting role for user ${userId}`);
    
    // Check cache first for performance
    if (teacherCache[userId] === true) {
      console.log(`User ${userId} is cached as teacher`);
      return 'teacher';
    }
    
    // Debug role issues
    await debugRoleCheck(userId);
    
    // Attempt to get from database
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log(`Role query result for ${userId}:`, { data, error });
      
      if (error) {
        // Fail silently but log
        console.log('User role query failed, defaulting to student:', error.message);
        return 'student';
      }
      
      if (!data) {
        console.log(`No role found for user ${userId}, defaulting to student`);
        return 'student';
      }
      
      // Cache result for teachers
      if (data.role === 'teacher') {
        console.log(`User ${userId} is set as teacher in database`);
        teacherCache[userId] = true;
      }
      
      return data.role as UserRole;
    } catch (error) {
      console.log('Error fetching role, defaulting to student', error);
      return 'student';
    }
  } catch (error) {
    // Default to student on any error
    console.error('Unexpected error in getUserRole:', error);
    return 'student';
  }
};

export const setUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // Update cache first
    if (role === 'teacher') {
      teacherCache[userId] = true;
    } else {
      delete teacherCache[userId];
    }
    
    // Try to update or insert
    const { data: existingRole, error: checkError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.log('Error checking for existing role:', checkError);
    }
    
    if (existingRole) {
      // Update existing role
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);
      
      if (error) {
        console.log('Error updating role:', error);
        return false;
      }
    } else {
      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) {
        console.log('Error creating role:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.log('Error in setUserRole:', error);
    return false;
  }
};

export const isTeacher = async (userId: string): Promise<boolean> => {
  // Check cache first
  if (teacherCache[userId] === true) {
    return true;
  }
  
  const role = await getUserRole(userId);
  return role === 'teacher';
}; 