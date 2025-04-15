"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SessionDebugPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bucketStatus, setBucketStatus] = useState<string>("Unknown");

  useEffect(() => {
    async function checkSession() {
      try {
        // Get the raw session data
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data);
        
        // Check bucket status
        checkBucketStatus();
      } catch (err: any) {
        setError(err.message);
        console.error("Session check error:", err);
      } finally {
        setLoading(false);
      }
    }
    
    checkSession();
  }, []);
  
  const checkBucketStatus = async () => {
    try {
      const { data, error } = await supabase.storage.getBucket('documents');
      if (error) {
        if (error.message.includes('not found')) {
          setBucketStatus("Not found - needs to be created");
        } else {
          setBucketStatus(`Error: ${error.message}`);
        }
      } else {
        setBucketStatus(`Found: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      setBucketStatus(`Error checking: ${err.message}`);
    }
  };

  const handleCreateBucket = async () => {
    try {
      setBucketStatus("Creating bucket...");
      const { data, error } = await supabase.storage.createBucket('documents', {
        public: true // For easier testing
      });
      
      if (error) {
        setBucketStatus(`Creation failed: ${error.message}`);
        throw error;
      }
      
      setBucketStatus(`Bucket created successfully: ${JSON.stringify(data)}`);
      alert("Storage bucket 'documents' created successfully!");
      
      // Create RLS policies for the bucket
      await createBucketPolicies();
      
    } catch (err: any) {
      alert(`Error creating bucket: ${err.message}`);
    }
  };
  
  const createBucketPolicies = async () => {
    // Note: This is not possible directly from the client SDK - would need to
    // be done through the Supabase dashboard or a server-side function
    setBucketStatus(prev => prev + "\n\nNOTE: Please set up bucket policies manually in the Supabase dashboard");
  };

  const handleCreateTestUser = async () => {
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'password123';
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });
      
      if (error) throw error;
      
      alert(`Test user created!\nEmail: ${testEmail}\nPassword: ${testPassword}`);
      window.location.reload();
    } catch (err: any) {
      alert(`Error creating test user: ${err.message}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Session Debug</h1>
      
      <div className="mb-6 flex flex-wrap gap-4">
        <Button onClick={handleCreateTestUser}>Create Test User</Button>
        <Button onClick={handleSignOut} variant="destructive">Sign Out</Button>
        <Button onClick={checkBucketStatus} variant="outline">Check Bucket Status</Button>
        <Button onClick={handleCreateBucket} variant="secondary">Create Documents Bucket</Button>
        <Link href="/debug">
          <Button variant="outline">Back to Debug Page</Button>
        </Link>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Storage Bucket Status</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto whitespace-pre-wrap">
            {bucketStatus}
          </pre>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Raw Session Data</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading session data...</p>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supabase Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
            {JSON.stringify({
              supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
              supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present (hidden)' : 'Not set',
              // Include hardcoded values from supabase.ts
              hardcodedUrl: "https://acvfkkpypmkkoyhgxxmx.supabase.co",
              hardcodedKeyPresent: "Yes (hidden for security)"
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
} 