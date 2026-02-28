
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Info, Loader2 } from "lucide-react";
import { 
  useAuth, 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase,
  addDocumentNonBlocking 
} from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { collection, query, where } from "firebase/firestore";

export default function DarshanPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if current user is already registered
  const registrationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "users", user.uid, "darshan_registrations");
  }, [db, user]);

  const { data: registrations, isLoading: isRegLoading } = useCollection(registrationsQuery);
  const isRegistered = registrations && registrations.length > 0;

  const handleLogin = async () => {
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "Authenticated Successfully",
        description: "Welcome! You can now register for Darshan.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Could not sign in with Google.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = () => {
    if (!db || !user) return;
    setIsSubmitting(true);
    
    const regData = {
      externalAuthUserId: user.uid,
      userName: user.displayName || "Anonymous",
      userEmail: user.email || "No Email",
      registrationDate: new Date().toISOString(),
      status: "Confirmed"
    };

    const userRegRef = collection(db, "users", user.uid, "darshan_registrations");
    
    addDocumentNonBlocking(userRegRef, regData);
    
    // Also add to a global collection for easier admin viewing if allowed, 
    // but based on rules we use the nested path. 
    // For the admin to see everything, we'd ideally use a collection group query or a flat collection.
    // Given the current backend.json, we'll stick to the nested path.
    
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
            Book your slot for the divine Sai Paduka Darshan. Registration is mandatory for all devotees to ensure a smooth experience.
          </p>
        </div>

        {!user ? (
          <Card className="max-w-md mx-auto shadow-2xl border-primary/20 bg-muted/30">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Google Login Required</CardTitle>
              <CardDescription>
                Registering with Google helps us provide you with a unique entry ID and updates regarding event timings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleLogin} 
                disabled={isSubmitting}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {isSubmitting ? "Connecting..." : "Continue with Google"}
              </Button>
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
                Thank you for registering, {user.displayName}. Please show your confirmation pass at the entrance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-dashed border-green-300 text-center">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">Entry Pass ID</span>
                <span className="text-2xl font-mono font-bold text-foreground">SAI-{registrations[0].id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-green-700">
                <Info className="h-5 w-5 shrink-0" />
                <p>Location: Aggarwal Bhavan, Ambala. Date: 9th March. Timing: 9:00 AM onwards.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-xl mx-auto shadow-2xl border-primary/20">
            <CardHeader>
              <CardTitle>Confirm Your Darshan</CardTitle>
              <CardDescription>You are logged in as {user.email}. Click the button below to confirm your registration for 9th March.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Registration is free but mandatory.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    One registration per person.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Senior citizens will have separate fast-track queues.
                  </li>
                </ul>
              </div>
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
