"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hash, setHash] = useState<string | null>(null);

  // Extract the hash from the URL on component mount
  useEffect(() => {
    // The hash will be in the URL when the user clicks the reset link from email
    const hashFromUrl = window.location.hash.substring(1);
    if (hashFromUrl) {
      setHash(hashFromUrl);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    
    if (!hash) {
      toast.error("Invalid reset link. Please request a new password reset.");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast.error("Failed to reset password: " + error.message);
        setLoading(false);
        return;
      }
      
      toast.success("Password reset successfully!");
      router.push("/login");
    } catch (error: any) {
      toast.error("An unexpected error occurred: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-2">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-950 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create New Password</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long.
              </p>
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !hash}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        {!hash && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-md">
            <p className="text-amber-700 dark:text-amber-300 text-sm text-center">
              Invalid or expired reset link. Please try again with a new password reset request.
            </p>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => router.push('/forgot-password')}
            >
              Request New Reset Link
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 