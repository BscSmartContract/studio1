"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  ShieldCheck, 
  Loader2, 
  LogOut, 
  Mail, 
  Send, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  Phone, 
  User as UserIcon,
  Check
} from "lucide-react";
import { 
  useAuth, 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase,
  addDocumentNonBlocking 
} from "@/firebase";
import { sendLoginLink } from "@/firebase/non-blocking-login";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut
} from "firebase/auth";
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

  // States for Name & Phone
  const [devoteeName, setDevoteeName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

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
        description: "Welcome! Please provide your contact details to complete registration.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message,
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
        title: "Divine Link Sent",
        description: `Check your inbox at ${email}.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delivery Failed",
        description: error.message,
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
      setDevoteeName('');
      setPhoneNumber('');
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not sign out." });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    
    if (!devoteeName || !phoneNumber) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please enter your name and phone number." });
      return;
    }

    setIsSubmitting(true);
    
    const regData = {
      externalAuthUserId: user.uid,
      userName: devoteeName || user.displayName || "Devotee",
      userEmail: user.email || "No Email",
      userPhone: phoneNumber,
      registrationDate: new Date().toISOString(),
      status: "Confirmed"
    };

    const userRegRef = collection(db, "users", user.uid, "darshan_registrations");
    addDocumentNonBlocking(userRegRef, regData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Registration Complete",
        description: "You have been registered for Sai Paduka Darshan.",
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
          <Card className="max-w-md mx-auto shadow-2xl border-primary/20 bg-muted/50 overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="text-center pt-8">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline">Verify Identity</CardTitle>
              <CardDescription>
                Step 1: Authenticate with Google or Email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-12">
              {loginMethod === 'options' && (
                <div className="space-y-4 px-4">
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
                    className="w-full h-12 flex items-center justify-center gap-2 border-primary/30"
                  >
                    <Mail className="h-5 w-5 text-primary" /> Continue with Email
                  </Button>
                </div>
              )}

              {loginMethod === 'email' && !emailSent && (
                <form onSubmit={handleEmailLogin} className="space-y-4 px-4 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-muted-foreground">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="devotee@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-primary" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : <><Send className="h-4 w-4 mr-2" /> Send Divine Link</>}
                  </Button>
                  <Button variant="ghost" onClick={() => setLoginMethod('options')} className="w-full text-xs text-muted-foreground">
                    <ArrowLeft className="h-3 w-3 mr-1" /> Use different method
                  </Button>
                </form>
              )}

              {emailSent && (
                <div className="text-center py-6 px-4 space-y-6">
                  <div className="bg-primary/5 p-6 rounded-full w-fit mx-auto relative">
                    <Mail className="h-12 w-12 text-primary" />
                    <Sparkles className="h-6 w-6 text-accent absolute top-0 right-0 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-headline font-bold text-foreground">Link Sent!</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Check your inbox at:<br />
                      <strong className="text-foreground">{email}</strong>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setEmailSent(false)} className="text-xs">
                    Try different email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : isRegistered ? (
          <Card className="max-w-md mx-auto shadow-2xl border-accent/20 bg-green-50/50">
            <CardHeader className="text-center pt-10">
              <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-headline text-green-800">Registration Confirmed!</CardTitle>
              <CardDescription>
                Om Sai Ram, {registrations[0].userName}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-10 px-8">
              <div className="p-6 bg-white rounded-2xl border border-dashed border-green-300 text-center shadow-inner">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">Divine Entry Pass ID</span>
                <span className="text-3xl font-mono font-bold text-foreground">SAI-{registrations[0].id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>Registered Phone: {registrations[0].userPhone}</p>
                <p>Please show this ID at the entry gate.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t bg-muted/20 py-4">
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
                <LogOut className="h-4 w-4 mr-2" /> Sign out ({user.email || 'Devotee'})
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="max-w-xl mx-auto shadow-2xl border-primary/20 overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            
            <CardHeader className="pt-10">
              <CardTitle className="text-3xl font-headline">Devotee Details</CardTitle>
              <CardDescription className="text-lg">Step 2: Enter your name and phone for our records</CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-6 pb-6 pt-4 px-8">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><UserIcon className="h-4 w-4 text-primary" /> Full Name</Label>
                  <Input 
                    placeholder="Enter your name" 
                    value={devoteeName} 
                    onChange={(e) => setDevoteeName(e.target.value)} 
                    required 
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Phone Number</Label>
                  <Input 
                    placeholder="e.g. +91 9876543210" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    required 
                    className="h-12"
                  />
                </div>
              </CardContent>
              <CardFooter className="px-8 pb-12 pt-0 flex flex-col gap-4">
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 h-16 text-xl shadow-lg rounded-full font-headline font-bold"
                >
                  {isSubmitting ? "Generating Entry Pass..." : "Confirm & Register"}
                </Button>
                <Button variant="ghost" onClick={handleSignOut} className="text-xs text-muted-foreground">
                  Cancel & Sign Out
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
