export type UserRole = 'student' | 'teacher';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      user_roles: {
        Row: UserRoleData;
        Insert: Omit<UserRoleData, 'id' | 'created_at'>;
        Update: Partial<Omit<UserRoleData, 'id' | 'created_at'>>;
      };
      documents: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_path: string;
          url: string;
          user_email: string;
          user_name: string | null;
          uploaded_by_teacher: boolean;
          teacher_email: string | null;
        };
      };
    };
  };
} 