"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Clock, PlusCircle } from 'lucide-react'

// Define the types without the nested profiles
type ForumTopic = {
  id: string
  title: string
  content: string
  user_id: string // Explicitly define as string
  category: string
  created_at: string
  updated_at: string
  reply_count: number
}

type UserProfile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string
}

export default function ForumPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    fetchTopics()
  }, [activeCategory])

  const fetchTopics = async () => {
    setLoading(true)
    try {
      // First, fetch the topics
      let query = supabase
        .from("forum_topics")
        .select("*")
        .order("updated_at", { ascending: false })

      if (activeCategory !== "all") {
        query = query.eq("category", activeCategory)
      }

      const { data: topicsData, error: topicsError } = await query

      if (topicsError) throw topicsError
      
      if (!topicsData || topicsData.length === 0) {
        setTopics([])
        setLoading(false)
        return
      }
      
      // Process the topics data to ensure user_id is treated as string
      const processedTopics = topicsData.map(topic => ({
        ...topic,
        user_id: String(topic.user_id) // Ensure user_id is a string
      })) as ForumTopic[]
      
      // Extract all user IDs from the topics
      const userIds = [...new Set(processedTopics.map(topic => topic.user_id))]
      
      // Fetch profiles for those user IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds)
      
      if (profilesError) throw profilesError
      
      // Create a map of user_id to profile
      const profilesMap: Record<string, UserProfile> = {}
      profilesData?.forEach(profile => {
        profilesMap[String(profile.id)] = {
          ...profile,
          id: String(profile.id) // Ensure id is a string
        } as UserProfile
      })
      
      setTopics(processedTopics)
      setProfiles(profilesMap)
    } catch (error) {
      console.error("Error fetching topics:", error)
      setTopics([])
    } finally {
      setLoading(false)
    }
  }

  const handleNewTopic = () => {
    if (!user) {
      router.push("/auth/login?redirect=/forum/new")
    } else {
      router.push("/forum/new")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getInitials = (userId: string) => {
    const profile = profiles[userId]
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }
    return profile?.email?.substring(0, 2).toUpperCase() || "U"
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Chinese":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "Mathematics":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "General":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "Help":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
          <p className="text-gray-600">Join discussions about Chinese language, mathematics, and learning strategies</p>
        </div>
        <Button onClick={handleNewTopic} className="bg-red-600 hover:bg-red-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Topic
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
        <div className="flex justify-center mb-8">
          <TabsList>
            <TabsTrigger value="all">All Topics</TabsTrigger>
            <TabsTrigger value="Chinese">Chinese</TabsTrigger>
            <TabsTrigger value="Mathematics">Mathematics</TabsTrigger>
            <TabsTrigger value="General">General</TabsTrigger>
            <TabsTrigger value="Help">Help</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeCategory} className="mt-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : topics.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium mb-2">No topics found</h3>
                <p className="text-gray-500 text-center max-w-md">
                  There are no topics in this category yet. Be the first to start a discussion!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <Card key={topic.id} className="overflow-hidden">
                  <Link href={`/forum/${topic.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl hover:text-red-600 transition-colors">{topic.title}</CardTitle>
                        <Badge className={getCategoryColor(topic.category)} variant="outline">
                          {topic.category}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{topic.content}</CardDescription>
                    </CardHeader>
                  </Link>
                  <CardFooter className="pt-2 border-t flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profiles[topic.user_id]?.avatar_url || ""} />
                        <AvatarFallback className="bg-red-100 text-red-800">
                          {getInitials(topic.user_id)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{profiles[topic.user_id]?.full_name || "User"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>{formatDate(topic.updated_at)}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="mr-1 h-4 w-4" />
                        <span>{topic.reply_count} replies</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}