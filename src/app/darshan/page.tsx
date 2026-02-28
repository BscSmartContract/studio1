
"use client";

import { useState, useEffect, useRef } from "react";
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
  Phone, 
  User as UserIcon,
  Users as UsersIcon,
  Plus,
  Minus,
  Printer,
  MessageSquare,
  Ticket,
  Download
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
import { toPng } from 'html-to-image';

export default function DarshanPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const passRef = useRef<HTMLDivElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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
    } catch (error: any) {
      toast({ variant: "destructive", title: "Delivery Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setEmailSent(false);
    setLoginMethod('options');
    setConfirmationMessage(null);
  };

  const handleDownloadImage = async () => {
    if (!passRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(passRef.current, { cacheBust: true, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `sai-darshan-pass-${currentReg?.id.substring(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Pass Downloaded", description: "You can now share this image on WhatsApp." });
    } catch (err) {
      console.error('Image generation failed', err);
      toast({ variant: "destructive", title: "Download Failed", description: "Could not generate pass image." });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    if (!currentReg) return;
    const uniqueCode = currentReg.id.substring(0, 8).toUpperCase();
    const text = `*Sai Paduka Darshan Confirmation*\n\nPass Code: ${uniqueCode}\nDevotee: ${currentReg.userName}\nPeople: ${currentReg.totalPeople}\nVenue: Aggarwal Bhavan, Ambala\n\nPlease show this code at entry.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;
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
      toast({ title: "Registration Complete", description: "Your digital pass has been generated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Registration Issue", description: "Could not complete registration." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || isRegLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;
  }

  const uniqueCode = currentReg?.id?.substring(0, 8).toUpperCase() || "PENDING";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentReg?.id || 'none')}`;

  return (
    <div className="py-12 bg-background min-h-screen">
      <div className="container px-4 mx-auto max-w-4xl">
        {!user ? (
          <Card className="max-w-md mx-auto shadow-2xl border-primary/20">
            <CardHeader className="text-center">
              <ShieldCheck className="h-10 w-10 text-primary mx-auto mb-4" />
              <CardTitle>Verify Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loginMethod === 'options' ? (
                <>
                  <Button onClick={handleGoogleLogin} className="w-full h-12">Continue with Google</Button>
                  <Button onClick={() => setLoginMethod('email')} variant="outline" className="w-full h-12">Email Link</Button>
                </>
              ) : (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  <Button type="submit" className="w-full" disabled={isSubmitting}>Send Link</Button>
                </form>
              )}
            </CardContent>
          </Card>
        ) : isRegistered ? (
          <div className="space-y-8">
            <div className="flex flex-wrap gap-4 justify-center print:hidden">
              <Button onClick={handleDownloadImage} disabled={isDownloading} className="bg-accent">
                {isDownloading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Save Pass Image
              </Button>
              <Button onClick={handleShareWhatsApp} className="bg-green-600">
                <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp Share
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" /> Print Pass
              </Button>
            </div>

            <div ref={passRef} className="bg-white p-4">
              <Card className="max-w-2xl mx-auto shadow-2xl border-primary overflow-hidden rounded-3xl bg-white">
                <div className="h-4 bg-primary" />
                <div className="p-8 space-y-8">
                  <div className="flex justify-between items-center border-b pb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-primary">Sai Paduka Darshan</h2>
                      <p className="text-muted-foreground">Entry Pass</p>
                      <div className="mt-4 inline-block px-4 py-1 bg-primary/10 rounded-full font-bold text-sm">
                        CODE: {uniqueCode}
                      </div>
                    </div>
                    <img src={qrUrl} alt="QR" className="w-24 h-24 border p-2 rounded-xl" />
                  </div>

                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <span className="text-xs font-bold text-muted-foreground uppercase">Devotee</span>
                      <p className="font-bold text-lg">{currentReg.userName}</p>
                      <p>{currentReg.userEmail}</p>
                      <p>{currentReg.userPhone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Schedule</span>
                      <p className="font-bold">9th March, 9:00 AM</p>
                      <p>Aggarwal Bhavan, Ambala</p>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-2xl p-4">
                    <h3 className="text-center font-bold text-primary mb-3">Attendees ({currentReg.totalPeople})</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {currentReg.devotees?.map((dev: any, i: number) => (
                        <div key={i} className="text-xs p-2 bg-white rounded border flex justify-between">
                          <span>{dev.name}</span>
                          <span className="font-bold">Age: {dev.age}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            {confirmationMessage && (
              <Card className="max-w-2xl mx-auto border-accent/20 bg-muted/10 print:hidden">
                <CardHeader><CardTitle className="text-sm font-bold uppercase">Divine Blessing</CardTitle></CardHeader>
                <CardContent className="whitespace-pre-wrap italic text-muted-foreground text-sm">
                  {confirmationMessage}
                </CardContent>
              </Card>
            )}
            
            <Button variant="ghost" onClick={handleSignOut} className="w-full print:hidden">Logout ({user.email})</Button>
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto shadow-2xl border-primary/20">
            <CardHeader><CardTitle>Darshan Registration</CardTitle></CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Total People</Label>
                    <div className="flex items-center gap-4 bg-white p-1 border rounded-lg">
                      <Button type="button" variant="ghost" size="icon" onClick={() => setTotalPeople(Math.max(1, totalPeople - 1))}><Minus /></Button>
                      <span className="font-bold">{totalPeople}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => setTotalPeople(totalPeople + 1)}><Plus /></Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {attendees.map((a, i) => (
                    <div key={i} className="p-4 border rounded-xl space-y-3 bg-muted/10">
                      <Label className="text-xs uppercase font-bold text-primary">Person {i + 1}</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <Input className="col-span-2" placeholder="Full Name" value={a.name} onChange={(e) => handleAttendeeChange(i, 'name', e.target.value)} required />
                        <Input type="number" placeholder="Age" value={a.age} onChange={(e) => handleAttendeeChange(i, 'age', e.target.value)} required />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-primary">Confirm Registration</Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
