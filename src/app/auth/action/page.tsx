'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { completeEmailLinkSignIn } from '@/firebase/non-blocking-login';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
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
        }, 2500);
      } catch (error: any) {
        console.error('Sign-in error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Failed to verify login link.');
      }
    }

    handleSignIn();
  }, [auth, router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 bg-background">
      <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-muted/10">
        <CardContent className="pt-16 pb-16 text-center">
          {status === 'verifying' && (
            <div className="space-y-6 animate-pulse">
              <div className="relative mx-auto w-16 h-16">
                <Loader2 className="h-16 w-16 animate-spin text-primary absolute inset-0" />
                <Sparkles className="h-6 w-6 text-accent absolute -top-2 -right-2" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-headline font-bold text-primary">Verifying Identity</h2>
                <p className="text-sm text-muted-foreground">Om Sai Ram. Please wait while we secure your connection...</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="mx-auto bg-green-50 p-6 rounded-full w-fit shadow-inner">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-headline font-bold text-green-800">Welcome, Devotee!</h2>
                <p className="text-muted-foreground">Authentication successful. Redirecting you to the portal...</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="mx-auto bg-destructive/5 p-6 rounded-full w-fit shadow-inner">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-headline font-bold text-foreground">Verification Failed</h2>
                <p className="text-destructive text-sm font-medium bg-destructive/10 py-2 px-4 rounded-lg inline-block">{errorMessage}</p>
                <p className="text-xs text-muted-foreground mt-4">The link may have expired or was already used.</p>
              </div>
              <Button asChild className="w-full mt-6 bg-primary hover:bg-primary/90">
                <Link href="/darshan">Back to Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
