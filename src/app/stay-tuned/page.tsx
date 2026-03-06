
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BellRing, Loader2, Sparkles, CheckCircle2, ShieldCheck, Mail, Send, ArrowLeft, Info } from "lucide-react";
import { useFirestore, setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase";
import { doc, collection } from "firebase/firestore";
import { sendOtp } from "@/ai/flows/send-otp-flow";

type Step = 'email' | 'otp' | 'details' | 'success';

export default function StayTunedPage() {
  const { toast } = useToast();
  const db = useFirestore();
  
  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  
  const [formData, setFormData] = useState({
    name: ""
  });

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone || !db) return;
    
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      
      // Call server-side flow which handles duplicate checks and OTP sending
      const result = await sendOtp({ 
        email: cleanEmail,
        phone: phone.trim()
      });

      if (result.alreadyRegistered) {
        toast({ 
          title: "Already Registered", 
          description: result.message 
        });
        setIsLoading(false);
        return;
      }

      if (!result.success || !result.code) {
        toast({ 
          variant: "destructive", 
          title: "Divine Message Error", 
          description: result.error || "Could not dispatch the verification code." 
        });
        setIsLoading(false);
        return;
      }

      setGeneratedOtp(result.code);
      
      // Store code in Firestore for verification (non-blocking)
      const otpRef = doc(db, "verification_codes", cleanEmail);
      setDocumentNonBlocking(otpRef, {
        email: cleanEmail,
        code: result.code,
        expiresAt: new Date(Date.now() + 10 * 60000).toISOString() // 10 mins
      }, { merge: true });

      // Also track in mail collection for record (optional since flow sent it)
      const mailColRef = collection(db, "mail");
      addDocumentNonBlocking(mailColRef, {
        to: cleanEmail,
        message: {
          subject: "Sai Parivar Ambala - Sacred Verification Code",
          text: result.message 
        }
      });

      setStep('otp');
      toast({ title: "Code Sent", description: "The divine code has been sent to your email." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === generatedOtp) {
      setStep('details');
      toast({ title: "Verified", description: "Identity confirmed. Please provide your name to complete the registration." });
    } else {
      toast({ variant: "destructive", title: "Invalid Code", description: "The verification code does not match." });
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setIsLoading(true);
    try {
      const subscribersCol = collection(db, "subscribers");
      addDocumentNonBlocking(subscribersCol, {
        name: formData.name,
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        isVerified: true,
        subscribedAt: new Date().toISOString()
      });
      
      setStep('success');
      toast({
        title: "Registration Successful",
        description: "Om Sai Ram. You will receive updates about our upcoming events.",
      });
    } catch (error) {
      toast({ variant: "destructive", title: "Registration Failed", description: "Please try again later." });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 shadow-2xl border-primary/20 bg-primary/5 rounded-[2rem]">
          <div className="mx-auto bg-primary/10 p-6 rounded-full w-fit">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-bold text-foreground">Stay Tuned!</h2>
            <p className="text-muted-foreground leading-relaxed">
              Om Sai Ram. Your details have been verified. You will be the first to know about upcoming spiritual gatherings.
            </p>
          </div>
          <Button asChild className="w-full bg-primary h-12 rounded-full">
            <a href="/">Back to Home</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-24 bg-background">
      <div className="container px-4 mx-auto max-w-4xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            Upcoming Events
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">Stay Tuned</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            "I shall draw my devotees from the ends of the earth." — Shri Sai Baba<br />
            Register to receive alerts for our future spiritual gatherings.
          </p>
        </div>

        <Card className="max-w-xl mx-auto shadow-2xl border-primary/20 overflow-hidden rounded-[2.5rem]">
          <div className="h-2 bg-primary w-full" />
          
          {step === 'email' && (
            <form onSubmit={handleRequestOtp}>
              <CardHeader className="pt-8 px-8 text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-headline">Step 1: Information</CardTitle>
                <CardDescription>Enter your details to receive a sacred code</CardDescription>
              </CardHeader>
              <CardContent className="px-8 space-y-6">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="devotee@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    placeholder="98XXX XXXXX" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                    className="h-12 rounded-xl"
                  />
                </div>
              </CardContent>
              <CardFooter className="px-8 pb-10 pt-4">
                <Button type="submit" disabled={isLoading} className="w-full bg-primary h-14 text-lg font-bold shadow-lg rounded-full">
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                  Send Divine Code
                </Button>
              </CardFooter>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <CardHeader className="pt-8 px-8 text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-headline">Step 2: Verify Code</CardTitle>
                <CardDescription>Enter the 6-digit code sent to {email}</CardDescription>
              </CardHeader>
              <CardContent className="px-8 space-y-4">
                <div className="space-y-2 text-center">
                  <Label>Verification Code</Label>
                  <Input 
                    placeholder="XXXXXX" 
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    required 
                    className="h-14 text-center text-2xl font-bold tracking-[0.5em] rounded-xl"
                  />
                  <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-muted/50 rounded-xl text-[10px] text-muted-foreground font-medium">
                    <Info className="h-3 w-3 text-primary" />
                    <span>Didn't receive the code? Please check your <strong>spam/junk folder</strong>.</span>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep('email')} className="text-xs text-muted-foreground w-full">
                   <ArrowLeft className="h-3 w-3 mr-1" /> Back to details
                </Button>
              </CardContent>
              <CardFooter className="px-8 pb-10 pt-4">
                <Button type="submit" className="w-full bg-primary h-14 text-lg font-bold shadow-lg rounded-full">
                  Verify & Continue
                </Button>
              </CardFooter>
            </form>
          )}

          {step === 'details' && (
            <form onSubmit={handleFinalSubmit}>
              <CardHeader className="pt-8 px-8 text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <BellRing className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-headline">Final Step: Complete Profile</CardTitle>
                <CardDescription>Verification successful for {email}</CardDescription>
              </CardHeader>
              <CardContent className="px-8 space-y-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="Enter your name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                    className="h-12 rounded-xl"
                  />
                </div>
              </CardContent>
              <CardFooter className="px-8 pb-10 pt-4">
                <Button type="submit" disabled={isLoading} className="w-full bg-primary h-14 text-lg font-bold shadow-lg rounded-full">
                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                  Confirm Subscription
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
