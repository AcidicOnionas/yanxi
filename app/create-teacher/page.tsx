"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function CreateTeacherPage() {
  const router = useRouter();
  const { createTeacherAccount } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCreateTeacher = async () => {
    setLoading(true);
    
    try {
      const { error } = await createTeacherAccount();
      
      if (error) {
        toast.error("Failed to create teacher account: " + error.message);
        setLoading(false);
        return;
      }
      
      toast.success("Teacher account created successfully. You can now log in.");
      router.push("/login");
    } catch (error: any) {
      toast.error("An unexpected error occurred: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-2">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Teacher Account</CardTitle>
          <CardDescription>
            This page is for creating the teacher account needed for the system.
            Only use this once to set up the initial teacher account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              This will create a teacher account with the following credentials:
            </p>
            <p className="font-mono p-2 bg-gray-100 dark:bg-gray-800 rounded">
              Email: teacher@example.com<br />
              Password: teacherPassword123
            </p>
            <p className="text-sm text-gray-500">
              Note: In a production environment, you should change these credentials
              to something more secure.
            </p>
            <Button 
              className="w-full" 
              onClick={handleCreateTeacher}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Teacher Account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 