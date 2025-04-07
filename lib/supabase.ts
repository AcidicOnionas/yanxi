import { createClient } from "@supabase/supabase-js"

// Create a singleton instance of the Supabase client
let supabaseInstance: ReturnType<typeof createClient> | null = null

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // In development, provide helpful error message
  if (process.env.NODE_ENV !== "production") {
    console.error(
      "Supabase URL and Anon Key are required. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.",
    )
  }

  // Return a mock client that won't crash but will log errors
  supabaseInstance = createMockClient()
} else {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
}

// Export the supabase client as a convenience
export const supabase = supabaseInstance

export function getSupabase() {
  return supabase
}

// Create a mock client for when credentials aren't available
function createMockClient() {
  const mockError = new Error("Supabase credentials not available")

  // Create a proxy that logs errors instead of crashing
  return new Proxy({} as ReturnType<typeof createClient>, {
    get: (target, prop) => {
      if (prop === "auth") {
        return {
          signUp: async () => ({ error: mockError }),
          signIn: async () => ({ error: mockError }),
          signOut: async () => ({ error: mockError }),
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        }
      }

      if (prop === "from") {
        return () => ({
          select: () => ({ data: null, error: mockError }),
          insert: () => ({ data: null, error: mockError }),
          update: () => ({ data: null, error: mockError }),
          delete: () => ({ data: null, error: mockError }),
        })
      }

      return () => {}
    },
  })
}

export type UserProfile = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: "student" | "teacher" | "admin"
  created_at: string
}

