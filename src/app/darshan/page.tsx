
"use client";

import { useState, useEffect } from "react";
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
  Users as UsersIcon,
  ScrollText,
  Plus,
  Minus,
  Printer,
  MessageSquare,
  Ticket,
  QrCode
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
import { sendConfirmationEmail } from "@/ai/flows/send-confirmation-email-flow";

export default function DarshanPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'options' | 'email'>('options');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  // States for Devotee Group Details
  const [contactPhone, setContactPhone] = useState('');
  const [totalPeople, setTotalPeople] = useState(1);
  const [attendees, setAttendees] = useState<{name: string, age: string}[]>([{name: '', age: ''}]);

  const registrationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "users", user.uid, "darshan_registrations");
  }, [db, user]);

  const { data: registrations, isLoading: isRegLoading } = useCollection(registrationsQuery);
  const currentReg = registrations?.[0];
  const isRegistered = registrations && registrations.length > 0;

  // Sync attendees array size with totalPeople
  useEffect(() => {
    setAttendees(prev => {
      const newAttendees = [...prev];
      if (totalPeople > prev.length) {
        for (let i = prev.length; i < totalPeople; i++) {
          newAttendees.push({ name: '', age: '' });
        }
      } else if (totalPeople < prev.length) {
        return newAttendees.slice(0, totalPeople);
      }
      return newAttendees;
    });
  }, [totalPeople]);

  const handleAttendeeChange = (index: number, field: 'name' | 'age', value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index][field] = value;
    setAttendees(newAttendees);
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: "Authenticated Successfully",
        description: "Please enter details of all members attending Darshan.",
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
      setAttendees([{name: '', age: ''}]);
      setContactPhone('');
      setTotalPeople(1);
      setConfirmationMessage(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not sign out." });
    }
  };

  const handleShareWhatsApp = () => {
    if (!currentReg) return;
    const uniqueCode = currentReg.id.substring(0, 8).toUpperCase();
    const text = `*Sai Paduka Darshan Confirmation*\n\nOm Sai Ram!\n\n*Pass Code:* ${uniqueCode}\n*Primary Devotee:* ${currentReg.userName}\n*Email:* ${currentReg.userEmail}\n*Phone:* ${currentReg.userPhone}\n*Total People:* ${currentReg.totalPeople}\n\n*Group Members:*\n${currentReg.devotees.map((d: any, i: number) => `${i+1}. ${d.name} (Age: ${d.age})`).join('\n')}\n\n*Venue:* Aggarwal Bhavan, Ambala\n*Date:* 9th March\n*Time:* 9:00 AM\n\nPlease show this code at the entry.\n\n_Sent from Sai Paduka Portal_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
    
    if (!contactPhone) {
      toast({ variant: "destructive", title: "Missing Phone", description: "Contact number is required." });
      return;
    }

    const invalidAttendee = attendees.find(a => !a.name || !a.age);
    if (invalidAttendee) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please enter name and age for all members." });
      return;
    }

    setIsSubmitting(true);
    
    const regData = {
      externalAuthUserId: user.uid,
      userName: attendees[0].name, 
      userEmail: user.email || "No Email",
      userPhone: contactPhone,
      totalPeople: totalPeople,
      devotees: attendees.map(a => ({ name: a.name, age: parseInt(a.age) })),
      registrationDate: new Date().toISOString(),
      isCheckedIn: false
    };

    try {
      const userRegRef = collection(db, "users", user.uid, "darshan_registrations");
      addDocumentNonBlocking(userRegRef, regData);
      
      if (user.email) {
        const result = await sendConfirmationEmail({
          userEmail: user.email,
          userName: regData.userName,
          totalPeople: regData.totalPeople,
          devotees: regData.devotees,
          eventDate: "9th March"
        });
        
        if (result.success && result.draftedContent) {
          setConfirmationMessage(result.draftedContent);

          const mailColRef = collection(db, "mail");
          addDocumentNonBlocking(mailColRef, {
            to: user.email,
            message: {
              subject: "Sai Paduka Darshan - Registration Confirmation",
              text: result.draftedContent
            }
          });
        }
      }

      toast({
        title: "Registration Complete",
        description: "Your digital pass has been generated.",
      });
    } catch (err) {
      console.error("Registration error:", err);
      toast({
        variant: "destructive",
        title: "Registration Issue",
        description: "We saved your slot, but could not process the confirmation message.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueCode = currentReg?.id?.substring(0, 8).toUpperCase() || "PENDING";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentReg?.id || 'none')}`;

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
        <div className="text-center mb-12 print:hidden">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Darshan Registration</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Book your divine slot. Please provide details of all individuals attending.
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
                Authenticate to start registration
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
                </div>
              )}
            </CardContent>
          </Card>
        ) : isRegistered ? (
          <div className="space-y-8">
             <div className="flex flex-col sm:flex-row gap-4 mb-4 print:hidden">
                <Button 
                  onClick={handleShareWhatsApp}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full h-12"
                >
                  <MessageSquare className="h-4 w-4 mr-2" /> Share on WhatsApp
                </Button>
                <Button 
                  variant="outline"
                  onClick={handlePrint}
                  className="flex-1 border-primary text-primary hover:bg-primary/5 rounded-full h-12"
                >
                  <Printer className="h-4 w-4 mr-2" /> Save/Print Pass
                </Button>
              </div>

            <Card id="digital-pass" className="max-w-2xl mx-auto shadow-2xl border-primary/20 bg-white overflow-hidden print:border-primary print:shadow-none print:m-0">
              <div className="h-4 bg-primary w-full" />
              <div className="p-8 md:p-12 space-y-10">
                {/* Pass Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b pb-8">
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-headline font-bold text-primary mb-1">Sai Paduka Darshan</h2>
                    <p className="text-muted-foreground font-medium">Official Digital Entry Pass</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary font-bold text-sm">
                      <Ticket className="h-4 w-4" />
                      CODE: {uniqueCode}
                    </div>
                  </div>
                  <div className="bg-white p-3 border rounded-2xl shadow-sm">
                    <img src={qrUrl} alt="Entry QR Code" className="w-32 h-32" />
                    <p className="text-[10px] text-center mt-2 font-bold text-muted-foreground">SCAN AT ENTRY</p>
                  </div>
                </div>

                {/* Devotee Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary Devotee</span>
                    <p className="text-xl font-bold text-foreground">{currentReg.userName}</p>
                    <div className="flex flex-col gap-1 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2"><Mail className="h-3 w-3" /> {currentReg.userEmail}</span>
                      <span className="flex items-center gap-2"><Phone className="h-3 w-3" /> {currentReg.userPhone}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-md md:text-right">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Event Schedule</span>
                     <p className="font-bold text-foreground">9th March, 9:00 AM</p>
                     <p className="text-muted-foreground text-sm">Aggarwal Bhavan, Ambala</p>
                     <div className="mt-4 inline-block px-4 py-1.5 bg-accent/10 rounded-full text-accent font-bold text-xs uppercase tracking-wider">
                        Entry: Door 1
                     </div>
                  </div>
                </div>

                {/* Group Details */}
                <div className="bg-muted/30 rounded-3xl p-6 border border-dashed border-primary/20">
                  <h3 className="text-center font-bold text-lg mb-4 text-primary uppercase tracking-widest flex items-center justify-center gap-2">
                    <UsersIcon className="h-4 w-4" /> Group Attendance ({currentReg.totalPeople})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentReg.devotees?.map((dev: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border text-sm shadow-sm">
                        <span className="font-medium">{idx + 1}. {dev.name}</span>
                        <span className="text-xs font-bold bg-primary/5 text-primary px-2 py-0.5 rounded-full">Age: {dev.age}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center space-y-4 pt-6">
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "Hands that serve are holier than lips that pray."<br />
                    Please present this pass at the verification desk upon arrival.
                  </p>
                  <div className="border-t pt-6 text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">
                    Authorized by Sai Parivar Ambala
                  </div>
                </div>
              </div>
            </Card>

            {confirmationMessage && (
              <Card className="max-w-2xl mx-auto border-accent/20 bg-[#FFFDF5] shadow-xl rounded-3xl print:hidden">
                <CardHeader>
                   <CardTitle className="flex items-center gap-2 text-primary uppercase tracking-widest text-sm">
                    <Sparkles className="h-4 w-4" /> Divine Blessing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground font-body italic">
                    {confirmationMessage}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-center print:hidden">
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-primary">
                <LogOut className="h-4 w-4 mr-2" /> Sign out ({user.email || 'Devotee'})
              </Button>
            </div>
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto shadow-2xl border-primary/20 overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            
            <CardHeader className="pt-10 px-8">
              <CardTitle className="text-3xl font-headline">Devotee Group Details</CardTitle>
              <CardDescription className="text-lg">Please provide the names and ages of all individuals attending Darshan.</CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-8 pb-6 pt-4 px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/30 rounded-3xl border">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Contact Phone</Label>
                    <Input 
                      placeholder="e.g. +91 9876543210" 
                      value={contactPhone} 
                      onChange={(e) => setContactPhone(e.target.value)} 
                      required 
                      className="h-12 bg-white rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><UsersIcon className="h-4 w-4 text-primary" /> Total People</Label>
                    <div className="flex items-center gap-4 bg-white rounded-xl p-1 border">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setTotalPeople(Math.max(1, totalPeople - 1))}
                        className="rounded-lg h-10 w-10 text-primary hover:bg-primary/10"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-xl font-bold flex-grow text-center">{totalPeople}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setTotalPeople(totalPeople + 1)}
                        className="rounded-lg h-10 w-10 text-primary hover:bg-primary/10"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-bold text-xl flex items-center gap-2 text-primary">
                    <UserIcon className="h-5 w-5" /> Devotee Information
                  </h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {attendees.map((attendee, index) => (
                      <div key={index} className="p-6 border rounded-3xl space-y-4 bg-muted/10 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-primary/60 bg-primary/5 px-3 py-1 rounded-full">
                            Person {index + 1} {index === 0 && "(Primary Devotee)"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label className="text-xs font-bold">Full Name</Label>
                            <Input 
                              placeholder="e.g. Rahul Sharma" 
                              value={attendee.name}
                              onChange={(e) => handleAttendeeChange(index, 'name', e.target.value)}
                              required
                              className="h-11 bg-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold">Age</Label>
                            <Input 
                              type="number" 
                              placeholder="Age" 
                              value={attendee.age}
                              onChange={(e) => handleAttendeeChange(index, 'age', e.target.value)}
                              required
                              className="h-11 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-8 pb-12 pt-6 flex flex-col gap-4">
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 h-16 text-xl shadow-lg rounded-full font-headline font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? "Processing Divine Booking..." : "Confirm Divine Booking"}
                </Button>
                <Button variant="ghost" type="button" onClick={handleSignOut} className="text-xs text-muted-foreground">
                  Cancel Registration & Sign Out
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
