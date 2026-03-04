
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BellRing, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection } from "firebase/firestore";

export default function StayTunedPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setIsSubmitting(true);
    try {
      const subscribersCol = collection(db, "subscribers");
      await addDocumentNonBlocking(subscribersCol, {
        ...formData,
        subscribedAt: new Date().toISOString()
      });
      
      setIsSuccess(true);
      toast({
        title: "Registration Successful",
        description: "Om Sai Ram. You will receive updates about our upcoming events.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 shadow-2xl border-primary/20 bg-primary/5 rounded-[2rem]">
          <div className="mx-auto bg-primary/10 p-6 rounded-full w-fit">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-bold text-foreground">Stay Tuned!</h2>
            <p className="text-muted-foreground leading-relaxed">
              Om Sai Ram. We have recorded your interest. You will be among the first to know about our upcoming divine celebrations.
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
            Register below to receive alerts for our future spiritual gatherings and Mahotsavs.
          </p>
        </div>

        <Card className="max-w-xl mx-auto shadow-2xl border-primary/20 overflow-hidden rounded-[2.5rem]">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="pt-8 px-8 text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <BellRing className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">Event Notifications</CardTitle>
            <CardDescription>Join our mailing list for divine updates</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-8">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Full Name</Label>
                <Input 
                  placeholder="Enter your name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email Address</Label>
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Phone Number (Optional)</Label>
                <Input 
                  placeholder="98XXX XXXXX" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="h-12 rounded-xl"
                />
              </div>
            </CardContent>
            <CardFooter className="px-8 pb-10 pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full bg-primary h-14 text-lg font-bold shadow-lg rounded-full">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                Notify Me
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
