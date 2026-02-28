"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Info, Loader2, LogOut, Mail, Send } from "lucide-react";
import { 
  useAuth, 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase,
  addDocumentNonBlocking 
} from "@/firebase";
import { sendLoginLink } from "@/firebase/non-blocking-login";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { collection } from "firebase/firestore";

export default function DarshanPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'options' | 'email'>('options');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  // Check if current user is already registered
  const registrationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "users", user.uid, "darshan_registrations");
  }, [db, user]);

  const { data: registrations, isLoading: isRegLoading } = useCollection(registrationsQuery);
  const isRegistered = registrations && registrations.length > 0;

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "Authenticated Successfully",
        description: "Welcome! You can now register for Darshan.",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.code === 'auth/operation-not-allowed' 
          ? "Google login is not enabled in your Firebase console. Please see the Admin Setup Guide." 
          : error.message || "Could not sign in with Google.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      await sendLoginLink(auth, email);
      setEmailSent(true);
      toast({
        title: "Link Sent!",
        description: `A divine login link has been sent to ${email}. Please check your inbox.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send link",
        description: error.message || "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setEmailSent(false);
      setLoginMethod('options');
      toast({ title: "Signed Out", description: "You have been logged out successfully." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not sign out." });
    }
  };

  const handleRegister = () => {
    if (!db || !user) return;
    setIsSubmitting(true);
    
    const regData = {
      externalAuthUserId: user.uid,
      userName: user.displayName || user.email?.split('@')[0] || "Devotee",
      userEmail: user.email || "No Email",
      registrationDate: new Date().toISOString(),
      status: "Confirmed"
    };

    const userRegRef = collection(db, "users", user.uid, "darshan_registrations");
    addDocumentNonBlocking(userRegRef, regData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Registration Complete",
        description: "You have been registered for Sai Paduka Darshan on 9th March.",
      });
    }, 1000);
  };

  if (isUserLoading || isRegLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-12 md:py-24 bg-background min-h-[calc(100vh-80px)]">
      <div className="container px-4 mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Darshan Registration</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Book your slot for the divine Sai Paduka Darshan.
          </p>
        </div>

        {!user ? (
          <Card className="max-w-md mx-auto shadow-2xl border-primary/20 bg-muted/30">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Identity Verification</CardTitle>
              <CardDescription>
                Choose a method to identify yourself and register.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loginMethod === 'options' && (
                <div className="space-y-4">
                  <Button 
                    onClick={handleGoogleLogin} 
                    disabled={isSubmitting}
                    className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>
                  <Button 
                    onClick={() => setLoginMethod('email')} 
                    variant="outline" 
                    className="w-full h-12 flex items-center justify-center gap-2"
                  >
                    <Mail className="h-5 w-5" /> Continue with Email
                  </Button>
                </div>
              )}

              {loginMethod === 'email' && !emailSent && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-primary" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <><Send className="h-4 w-4 mr-2" /> Send Login Link</>}
                  </Button>
                  <Button variant="ghost" onClick={() => setLoginMethod('options')} className="w-full text-xs">
                    Back to other options
                  </Button>
                </form>
              )}

              {emailSent && (
                <div className="text-center py-6 space-y-4">
                  <div className="bg-primary/10 p-4 rounded-full w-fit mx-auto">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground">
                    We sent a login link to <strong>{email}</strong>. 
                  </p>
                  <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-800 text-left">
                    <strong>Don't see it?</strong>
                    <ul className="mt-1 list-disc pl-4 space-y-1">
                      <li>Check your <strong>Spam</strong> or Junk folder.</li>
                    </ul>
                  </div>
                  <Button variant="link" onClick={() => setEmailSent(false)} className="text-xs text-primary">
                    Try again with a different email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : isRegistered ? (
          <Card className="max-w-md mx-auto shadow-2xl border-accent/20 bg-green-50/50">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-2xl text-green-800">Registration Confirmed!</CardTitle>
              <CardDescription>
                Thank you, {user.displayName || user.email?.split('@')[0] || "Devotee"}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-dashed border-green-300 text-center">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">Entry Pass ID</span>
                <span className="text-2xl font-mono font-bold text-foreground">SAI-{registrations[0].id.substring(0, 8).toUpperCase()}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
                <LogOut className="h-4 w-4 mr-2" /> Sign out ({user.email})
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="max-w-xl mx-auto shadow-2xl border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Confirm Your Darshan</CardTitle>
                  <CardDescription>Logged in as {user.email}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleRegister} 
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 h-14 text-xl shadow-lg rounded-full"
              >
                {isSubmitting ? "Processing..." : "Register Now"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
