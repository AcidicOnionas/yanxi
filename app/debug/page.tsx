"use client";

import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DebugPage() {
  const { user, role, session, loading } = useAuth();
  const router = useRouter();

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Debug Authentication</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
          <CardDescription>
            Current user information and authentication state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
            {JSON.stringify({
              isLoading: loading,
              isAuthenticated: !!session,
              role,
              user: user ? {
                id: user.id,
                email: user.email,
                createdAt: user.created_at,
              } : null,
              sessionExists: !!session,
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard">
          <Button variant={role === 'student' ? "default" : "outline"}>
            Go to Student Dashboard
          </Button>
        </Link>
        
        <Link href="/teacher-portal">
          <Button variant={role === 'teacher' ? "default" : "outline"}>
            Go to Teacher Portal
          </Button>
        </Link>
        
        <Link href="/">
          <Button variant="outline">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
} 