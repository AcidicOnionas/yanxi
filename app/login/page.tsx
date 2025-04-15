"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Create a client component that uses useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirectedFrom") || "/dashboard";
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error("Login failed: " + error.message);
        setLoading(false);
        return;
      }
      
      toast.success("Logged in successfully!");
      router.push(redirectPath);
    } catch (error: any) {
      toast.error("An unexpected error occurred: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-2">
      <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-950 rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Log In</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back! Please enter your details.
          </p>
        </div>

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
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Logging in..." : "Log in"}
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <Link 
                href="/signup" 
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Teacher login information:
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              To use the teacher account, you need to create it first.
            </p>
            <div className="mt-2">
              <Link href="/create-teacher">
                <Button variant="outline" size="sm" className="w-full">
                  Create Teacher Account
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Wrap with Suspense in the default export
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container flex items-center justify-center min-h-[80vh]">
        <div className="w-full max-w-md p-8 text-center">
          Loading...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 