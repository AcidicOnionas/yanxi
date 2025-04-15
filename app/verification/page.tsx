"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, AlertTriangle } from "lucide-react";

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [countdown, setCountdown] = useState(60);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Redirect when countdown reaches zero
      router.push("/login");
    }
  }, [countdown, router]);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[80vh] py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription className="text-lg mt-2">
            Verification link sent
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>
            We've sent a verification email to:
          </p>
          <p className="font-medium text-lg break-all">
            {email}
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mt-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-left text-amber-800 dark:text-amber-300">
              <p>Please check your email and click the verification link to activate your account.</p>
              <p className="mt-1">You won't be able to access your dashboard until your email is verified.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Link href="/login" className="w-full">
            <Button variant="default" className="w-full">
              Return to Login
            </Button>
          </Link>
          {countdown > 0 && (
            <p className="text-sm text-gray-500 text-center">
              Redirecting to login in {countdown} seconds...
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={
      <div className="container flex flex-col items-center justify-center min-h-[80vh] py-10">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            Loading...
          </CardContent>
        </Card>
      </div>
    }>
      <VerificationContent />
    </Suspense>
  );
} 