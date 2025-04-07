"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from '@/lib/supabase'
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, MessageSquare, Clock, Loader2 } from 'lucide-react'
import Link from "next/link"

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

type ForumReply = {
  id: string
  topic_id: string
  user_id: string // Explicitly define as string
  content: string
  created_at: string
}

type UserProfile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string
}

export default function TopicPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [topic, setTopic] = useState<ForumTopic | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({})
  const [newReply, setNewReply] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch the topic
      const { data: topicData, error: topicError } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('id', params.id)
        .single()

      if (topicError) throw topicError
      
      // Process topic data to ensure user_id is a string
      const processedTopic = {
        ...topicData,
        user_id: String(topicData.user_id) // Ensure user_id is a string
      } as ForumTopic
      
      setTopic(processedTopic)

      // Fetch the replies
      const { data: repliesData, error: repliesError } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('topic_id', params.id)
        .order('created_at', { ascending: true })

      if (repliesError) throw repliesError
      
      // Process replies data to ensure user_id is a string
      const processedReplies = repliesData.map(reply => ({
        ...reply,
        user_id: String(reply.user_id) // Ensure user_id is a string
      })) as ForumReply[]
      
      setReplies(processedReplies)

      // Collect all user IDs
      const userIds = new Set<string>()
      userIds.add(processedTopic.user_id)
      processedReplies.forEach(reply => userIds.add(reply.user_id))

      // Fetch profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', Array.from(userIds))

      if (profilesError) throw profilesError

      // Create a map of user_id to profile
      const profilesMap: Record<string, UserProfile> = {}
      profilesData?.forEach(profile => {
        profilesMap[String(profile.id)] = {
          ...profile,
          id: String(profile.id) // Ensure id is a string
        } as UserProfile
      })

      setProfiles(profilesMap)
    } catch (error) {
      console.error('Error fetching data:', error)
      router.push('/forum')
    } finally {
      setLoading(false)
    }
  }

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReply(e.target.value)
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push(`/auth/login?redirect=/forum/${params.id}`)
      return
    }
    
    if (!newReply.trim()) {
      setError('Reply cannot be empty')
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      // Insert the reply
      const { error: replyError } = await supabase
        .from('forum_replies')
        .insert([
          {
            topic_id: params.id,
            user_id: user.id,
            content: newReply,
          },
        ])

      if (replyError) throw replyError
      
      // Update the reply count
      const { error: updateError } = await supabase
        .from('forum_topics')
        .update({ 
          reply_count: (topic?.reply_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        
      if (updateError) throw updateError
      
      // Refresh the data
      fetchData()
      setNewReply('')
    } catch (error: any) {
      setError(error.message || 'Failed to post reply')
    } finally {
      setSubmitting(false)
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

  if (loading) {
    return (
      <div className="container py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertDescription>Topic not found</AlertDescription>
        </Alert>
        <Button asChild className="mt-4">
          <Link href="/forum">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/forum">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <CardTitle className="text-2xl">{topic.title}</CardTitle>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Clock className="mr-1 h-4 w-4" />
                <span>{formatDate(topic.created_at)}</span>
              </div>
            </div>
            <Badge className={getCategoryColor(topic.category)} variant="outline">
              {topic.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{topic.content}</p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={profiles[topic.user_id]?.avatar_url || ""} />
              <AvatarFallback className="bg-red-100 text-red-800">
                {getInitials(topic.user_id)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{profiles[topic.user_id]?.full_name || "User"}</p>
              <p className="text-sm text-gray-500">Author</p>
            </div>
          </div>
        </CardFooter>
      </Card>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Replies ({replies.length})
        </h2>

        {replies.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-gray-500">
              No replies yet. Be the first to respond!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {replies.map((reply) => (
              <Card key={reply.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <Avatar>
                      <AvatarImage src={profiles[reply.user_id]?.avatar_url || ""} />
                      <AvatarFallback className="bg-red-100 text-red-800">
                        {getInitials(reply.user_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{profiles[reply.user_id]?.full_name || "User"}</p>
                      <p className="text-sm text-gray-500">{formatDate(reply.created_at)}</p>
                    </div>
                  </div>
                  <Separator className="mb-4" />
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{reply.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Post a Reply</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!user ? (
            <div className="text-center py-4">
              <p className="mb-4">You need to be logged in to reply</p>
              <Button asChild>
                <Link href={`/auth/login?redirect=/forum/${params.id}`}>Sign In to Reply</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReply}>
              <Textarea
                placeholder="Share your thoughts..."
                rows={5}
                value={newReply}
                onChange={handleReplyChange}
                className="mb-4"
              />
              <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Reply"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}