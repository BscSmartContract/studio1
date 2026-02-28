"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, CheckCircle2, ShieldCheck, Loader2, Mail, Send, LogOut } from "lucide-react";
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
          <Card className="max-w-md mx-auto shadow-2xl border-primary/20 bg-muted/30">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Authentication Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loginMethod === 'options' && (
                <div className="space-y-4">
                  <Button onClick={handleGoogleLogin} disabled={isSubmitting} className="w-full h-12 bg-white text-gray-700 border border-gray-300">
                    Continue with Google
                  </Button>
                  <Button onClick={() => setLoginMethod('email')} variant="outline" className="w-full h-12">
                    <Mail className="h-5 w-5 mr-2" /> Continue with Email
                  </Button>
                </div>
              )}

              {loginMethod === 'email' && !emailSent && (
                <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="devotee@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Send Login Link'}
                  </Button>
                  <Button variant="ghost" onClick={() => setLoginMethod('options')} className="w-full text-xs">
                    Other options
                  </Button>
                </form>
              )}

              {emailSent && (
                <div className="text-center py-6 space-y-4">
                  <Mail className="h-12 w-12 text-primary mx-auto" />
                  <h3 className="font-bold">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground">A login link was sent to {email}.</p>
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
                </ul>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full">
                <LogOut className="h-4 w-4 mr-2" /> Sign out ({user.email})
              </Button>
            </div>

            <Card className="md:col-span-2 shadow-xl border-primary/20">
              <CardHeader>
                <CardTitle>Volunteer Signup Form</CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="98XXX XXXXX" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">Area of Service</Label>
                    <Select value={formData.service} onValueChange={(value) => setFormData({...formData, service: value})}>
                      <SelectTrigger>
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
                <CardFooter>
                  <Button type="submit" className="w-full bg-primary h-12" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
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
