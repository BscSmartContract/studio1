'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { completeEmailLinkSignIn } from '@/firebase/non-blocking-login';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthActionPage() {
  const auth = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function handleSignIn() {
      try {
        await completeEmailLinkSignIn(auth);
        setStatus('success');
        // Redirect to darshan page after a short delay
        setTimeout(() => {
          router.push('/darshan');
        }, 2000);
      } catch (error: any) {
        console.error('Sign-in error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Failed to verify login link.');
      }
    }

    handleSignIn();
  }, [auth, router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardContent className="pt-10 pb-10 text-center">
          {status === 'verifying' && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <CardTitle>Verifying Login Link</CardTitle>
              <CardDescription>Please wait while we secure your connection...</CardDescription>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="mx-auto bg-green-100 p-4 rounded-full w-fit">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle>Login Successful!</CardTitle>
              <CardDescription>Redirecting you to the portal...</CardDescription>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <CardTitle>Verification Failed</CardTitle>
              <CardDescription className="text-destructive font-medium">{errorMessage}</CardDescription>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/darshan">Back to Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
