"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast.error("Failed to send reset email: " + error.message);
        setLoading(false);
        return;
      }
      
      setResetSent(true);
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (error: any) {
      toast.error("An unexpected error occurred: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-2">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-950 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {resetSent 
              ? "Check your email for the reset link" 
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {!resetSent ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <Link 
                  href="/login" 
                  className="font-medium text-primary hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
              <p className="text-center text-green-700 dark:text-green-300">
                We've sent an email to <strong>{email}</strong> with instructions to reset your password.
              </p>
            </div>
            
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Return to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 