
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, CheckCircle2, ShieldCheck, Loader2, Mail, Send, LogOut, ArrowLeft, Sparkles, Info } from "lucide-react";
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

export default function VolunteerPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'options' | 'email'>('options');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "",
  });

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Signed In", description: "Successfully authenticated with Google." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: error.message });
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
        description: `Login link sent to ${email}.`,
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setEmailSent(false);
    setLoginMethod('options');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    if (!formData.name || !formData.phone || !formData.service) {
      toast({ variant: "destructive", title: "Missing Information", description: "All fields are required." });
      return;
    }
    
    setIsSubmitting(true);
    
    const volunteerData = {
      externalAuthUserId: user.uid,
      name: formData.name,
      phoneNumber: formData.phone,
      email: user.email,
      areaOfService: [formData.service],
      registrationDate: new Date().toISOString(),
    };

    const volunteerRef = collection(db, "users", user.uid, "volunteers");
    addDocumentNonBlocking(volunteerRef, volunteerData);

    setTimeout(() => {
      setIsSubmitting(false);
      toast({ title: "Success", description: "Registration submitted successfully!" });
      setFormData({ name: "", phone: "", service: "" });
    }, 1500);
  };

  if (isUserLoading) {
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
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Volunteer Service</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            "Hands that serve are holier than lips that pray." Join us in making the Sai Paduka event seamless.
          </p>
        </div>

        {!user ? (
          <Card className="max-w-md mx-auto shadow-2xl border-primary/20 bg-muted/30 overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="text-center pt-8">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline">Verify Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-12">
              {loginMethod === 'options' && (
                <div className="space-y-4 px-4">
                  <Button onClick={handleGoogleLogin} disabled={isSubmitting} className="w-full h-12 bg-white text-gray-700 border border-gray-300">
                    Continue with Google
                  </Button>
                  <Button onClick={() => setLoginMethod('email')} variant="outline" className="w-full h-12 border-primary/30">
                    <Mail className="h-5 w-5 mr-2 text-primary" /> Continue with Email
                  </Button>
                </div>
              )}

              {loginMethod === 'email' && !emailSent && (
                <form onSubmit={handleEmailLogin} className="space-y-4 px-4 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-muted-foreground">Email Address</Label>
                    <Input id="email" type="email" placeholder="devotee@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" />
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
                    <p className="text-sm text-muted-foreground">
                      Check your inbox at:<br />
                      <strong className="text-foreground">{email}</strong>
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-white/50 rounded-xl text-[10px] text-muted-foreground">
                      <Info className="h-3 w-3 text-primary shrink-0" />
                      <span>Didn't receive the link? Please check your <strong>spam/junk folder</strong>.</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setEmailSent(false)} className="text-xs">
                    Try different email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <h3 className="font-headline font-bold text-xl mb-4 flex items-center gap-2">
                  <Heart className="text-primary h-5 w-5" /> Areas of Service
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    <span>Crowd Management</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    <span>Prasad Distribution</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    <span>Cleanliness</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    <span>Medical Help</span>
                  </li>
                </ul>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full text-muted-foreground">
                <LogOut className="h-4 w-4 mr-2" /> Sign out ({user.email})
              </Button>
            </div>

            <Card className="md:col-span-2 shadow-xl border-primary/20 overflow-hidden">
              <div className="h-2 bg-primary w-full" />
              <CardHeader className="pt-8 px-8">
                <CardTitle className="text-2xl font-headline">Volunteer Signup Form</CardTitle>
                <CardDescription>We appreciate your dedication to serve.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 px-8">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-muted-foreground">Full Name</Label>
                    <Input id="name" placeholder="Enter your name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-muted-foreground">Phone Number</Label>
                    <Input id="phone" placeholder="98XXX XXXXX" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service" className="text-muted-foreground">Area of Service</Label>
                    <Select value={formData.service} onValueChange={(value) => setFormData({...formData, service: value})}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select service area" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crowd">Crowd Management</SelectItem>
                        <SelectItem value="prasad">Prasad Distribution</SelectItem>
                        <SelectItem value="cleanliness">Cleanliness</SelectItem>
                        <SelectItem value="medical">Medical Help</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="px-8 pb-10 pt-4">
                  <Button type="submit" className="w-full bg-primary h-14 text-lg font-headline font-bold shadow-lg rounded-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Confirm & Submit Signup"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
