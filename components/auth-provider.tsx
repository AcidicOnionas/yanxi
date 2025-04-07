"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { getSupabase } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"
import type { UserProfile } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return

    const supabase = getSupabase()

    const fetchSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user || null)

        if (session?.user) {
          const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          setProfile(data as UserProfile)
        }
      } catch (error) {
        console.error("Error fetching session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user || null)

      if (session?.user) {
        try {
          const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

          setProfile(data as UserProfile)
        } catch (error) {
          console.error("Error fetching profile:", error)
        }
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    const supabase = getSupabase()
    await supabase.auth.signOut()
  }

  return <AuthContext.Provider value={{ user, profile, session, isLoading, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

