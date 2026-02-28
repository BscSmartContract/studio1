
"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  HandHeart, 
  Settings, 
  Heart, 
  Plus,
  Trash2,
  Video,
  Sparkles,
  Loader2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  LogIn,
  LogOut,
  Mail,
  Smartphone,
  Lock,
  Copy,
  Info,
  ScanLine,
  CheckCircle2,
  QrCode
} from "lucide-react";
import { 
  useAuth,
  useUser,
  useFirestore, 
  useDoc, 
  useCollection, 
  useMemoFirebase,
  updateDocumentNonBlocking,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking
} from "@/firebase";
import { doc, collection, collectionGroup, query, orderBy } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminPanel() {
  const { toast } = useToast();
  const db = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading: authLoading } = useUser();

  const ADMIN_EMAIL = "theroasterop1@gmail.com";
  const isActuallyAdmin = user?.email === ADMIN_EMAIL;

  // Conditional Queries
  const configRef = useMemoFirebase(() => (db && isActuallyAdmin) ? doc(db, "app_configuration", "main") : null, [db, isActuallyAdmin]);
  const blessingsRef = useMemoFirebase(() => (db && isActuallyAdmin) ? query(collection(db, "daily_blessing_photos"), orderBy("blessingDate", "desc")) : null, [db, isActuallyAdmin]);
  
  const allRegistrationsQuery = useMemoFirebase(() => 
    (db && isActuallyAdmin) ? collectionGroup(db, "darshan_registrations") : null, 
  [db, isActuallyAdmin]);
  
  const allVolunteersQuery = useMemoFirebase(() => 
    (db && isActuallyAdmin) ? collectionGroup(db, "volunteers") : null, 
  [db, isActuallyAdmin]);

  const { data: config } = useDoc(configRef);
  const { data: blessings } = useCollection(blessingsRef);
  const { data: allRegistrations, isLoading: regLoading } = useCollection(allRegistrationsQuery);
  const { data: allVolunteers, isLoading: volLoading } = useCollection(allVolunteersQuery);

  const [liveUrl, setLiveUrl] = useState("");
  const [blessingImg, setBlessingImg] = useState("");
  const [blessingCaption, setBlessingCaption] = useState("");
  const [blessingDate, setBlessingDate] = useState(new Date().toISOString().split('T')[0]);

  // Check-in logic
  const [passCodeInput, setPassCodeInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [foundRegistration, setFoundRegistration] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (config) {
      setLiveUrl(config.liveDarshanYoutubeLink || "");
    }
  }, [config]);

  useEffect(() => {
    if (scanning) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({video: true});
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this app.',
          });
        }
      };
      getCameraPermission();
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [scanning, toast]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Verification Attempted", description: "Checking administrator status..." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign In Failed", description: error.message });
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleUpdateLiveLink = () => {
    if (!configRef) return;
    updateDocumentNonBlocking(configRef, {
      liveDarshanYoutubeLink: liveUrl,
      lastUpdatedAt: new Date().toISOString()
    });
    toast({ title: "Updated", description: "Live Darshan link updated successfully." });
  };

  const handleAddBlessing = () => {
    if (!db || !blessingImg) return;
    const blessingsCol = collection(db, "daily_blessing_photos");
    addDocumentNonBlocking(blessingsCol, {
      imageUrl: blessingImg,
      blessingDate,
      caption: blessingCaption,
      uploadedAt: new Date().toISOString()
    });
    setBlessingImg("");
    setBlessingCaption("");
    toast({ title: "Success", description: "Daily Blessing photo uploaded." });
  };

  const handleDeleteBlessing = (id: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, "daily_blessing_photos", id));
    toast({ title: "Removed", description: "Photo removed from blessings list." });
  };

  const handleSearchPass = async () => {
    if (!passCodeInput || !allRegistrations) return;
    
    const cleanCode = passCodeInput.trim().toUpperCase();
    const match = allRegistrations.find(r => 
      r.id.toUpperCase().startsWith(cleanCode) || r.id === passCodeInput
    );

    if (match) {
      setFoundRegistration(match);
      toast({ title: "Pass Found", description: `Registration for ${match.userName} loaded.` });
    } else {
      setFoundRegistration(null);
      toast({ variant: "destructive", title: "Not Found", description: "No registration matches this code." });
    }
  };

  const handleCheckIn = () => {
    if (!foundRegistration || !db) return;
    
    const regRef = doc(db, "users", foundRegistration.externalAuthUserId, "darshan_registrations", foundRegistration.id);
    updateDocumentNonBlocking(regRef, {
      isCheckedIn: true,
      checkInTime: new Date().toISOString()
    });

    setFoundRegistration({ ...foundRegistration, isCheckedIn: true });
    toast({ title: "Check-in Successful", description: "Devotee entry has been recorded." });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Value copied to clipboard." });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <Card className="w-full max-w-md shadow-2xl border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-headline">Admin Access</CardTitle>
            <CardDescription>Sign in with Google to access the management portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGoogleSignIn} className="w-full h-12 flex items-center gap-2">
              <LogIn className="h-4 w-4" /> Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isActuallyAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <Card className="w-full max-w-md shadow-2xl border-destructive/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="text-destructive h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-headline text-destructive">Access Denied</CardTitle>
            <CardDescription>
              Your account <strong>{user.email}</strong> does not have administrator privileges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Please sign in with the authorized admin email <strong>{ADMIN_EMAIL}</strong>.
            </p>
            <Button variant="outline" onClick={handleSignOut} className="w-full">
              Sign out and try another account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 bg-background">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground">Admin Control Panel</h1>
            <p className="text-sm text-primary font-bold">Authorized Admin: {user.email}</p>
          </div>
          <Button variant="ghost" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
        </div>

        <Tabs defaultValue="entry-checkin" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto p-1 bg-muted rounded-xl mb-8">
            <TabsTrigger value="entry-checkin" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <ScanLine className="h-4 w-4 mr-2" /> Entry
            </TabsTrigger>
            <TabsTrigger value="registrations" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" /> Darshan
            </TabsTrigger>
            <TabsTrigger value="blessings" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Sparkles className="h-4 w-4 mr-2" /> Blessings
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <HandHeart className="h-4 w-4 mr-2" /> Volunteers
            </TabsTrigger>
            <TabsTrigger value="live-darshan" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Video className="h-4 w-4 mr-2" /> Live
            </TabsTrigger>
            <TabsTrigger value="setup" className="py-3 data-[state=active]:bg-accent data-[state=active]:text-white">
              <ShieldCheck className="h-4 w-4 mr-2" /> Setup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entry-checkin">
             <div className="max-w-4xl mx-auto space-y-8">
                <Card className="shadow-lg border-primary/20">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <ScanLine className="text-primary" /> Venue Entry Check-in
                    </CardTitle>
                    <CardDescription>Verify devotee passes and record entry</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1 space-y-2">
                        <Label>Enter Pass Code (8 characters)</Label>
                        <Input 
                          placeholder="e.g. 7A8B9C10" 
                          value={passCodeInput} 
                          onChange={(e) => setPassCodeInput(e.target.value.toUpperCase())}
                          className="h-12 text-xl font-bold tracking-widest text-center"
                        />
                      </div>
                      <Button onClick={handleSearchPass} className="h-12 px-8 bg-primary">Search Devotee</Button>
                      <Button variant="outline" className="h-12 px-6" onClick={() => setScanning(!scanning)}>
                         <QrCode className="h-4 w-4 mr-2" /> {scanning ? "Close Camera" : "Open Scanner"}
                      </Button>
                    </div>

                    {scanning && (
                      <div className="space-y-4">
                        <video ref={videoRef} className="w-full aspect-video rounded-3xl bg-black border-4 border-primary/20 shadow-xl" autoPlay muted />
                        <p className="text-center text-xs text-muted-foreground animate-pulse">
                          Hold the devotee's QR code in front of the camera...
                        </p>
                      </div>
                    )}

                    {foundRegistration && (
                      <Card className={`mt-8 border-2 ${foundRegistration.isCheckedIn ? 'bg-green-50 border-green-200' : 'bg-primary/5 border-primary/20'}`}>
                        <div className="p-6">
                           <div className="flex justify-between items-start mb-6">
                              <div>
                                <h3 className="text-2xl font-bold">{foundRegistration.userName}</h3>
                                <p className="text-sm text-muted-foreground">{foundRegistration.userPhone}</p>
                              </div>
                              <div className={`px-4 py-1.5 rounded-full font-bold text-xs ${foundRegistration.isCheckedIn ? 'bg-green-600 text-white' : 'bg-primary text-white'}`}>
                                {foundRegistration.isCheckedIn ? 'CHECKED IN' : 'PENDING'}
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="p-4 bg-white rounded-2xl shadow-sm border">
                                 <span className="text-[10px] font-bold uppercase block mb-1">Group Size</span>
                                 <span className="text-2xl font-bold text-primary">{foundRegistration.totalPeople} Persons</span>
                              </div>
                              <div className="p-4 bg-white rounded-2xl shadow-sm border">
                                 <span className="text-[10px] font-bold uppercase block mb-1">Pass Code</span>
                                 <span className="text-lg font-bold font-mono">{foundRegistration.id.substring(0, 8).toUpperCase()}</span>
                              </div>
                           </div>

                           <div className="space-y-3">
                              <h4 className="font-bold text-xs uppercase text-muted-foreground">Attendance List</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                 {foundRegistration.devotees?.map((dev: any, i: number) => (
                                   <div key={i} className="flex justify-between items-center p-2 bg-white rounded-lg border text-sm">
                                      <span>{dev.name}</span>
                                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded">Age: {dev.age}</span>
                                   </div>
                                 ))}
                              </div>
                           </div>
                           
                           {!foundRegistration.isCheckedIn && (
                             <Button onClick={handleCheckIn} className="w-full mt-8 h-16 text-xl font-bold bg-green-600 hover:bg-green-700 shadow-lg rounded-2xl">
                               Confirm & Complete Entry
                             </Button>
                           )}
                        </div>
                      </Card>
                    )}
                  </CardContent>
                </Card>
             </div>
          </TabsContent>

          <TabsContent value="registrations">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Darshan Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                {regLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : allRegistrations && allRegistrations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total People</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allRegistrations.map((reg) => (
                        <TableRow key={reg.id}>
                          <TableCell className="font-medium">
                             <div>{reg.userName || "N/A"}</div>
                             <div className="text-[10px] text-muted-foreground font-mono">{reg.id.substring(0, 8).toUpperCase()}</div>
                          </TableCell>
                          <TableCell>
                            {reg.isCheckedIn ? (
                              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">IN</span>
                            ) : (
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">WAITING</span>
                            )}
                          </TableCell>
                          <TableCell>
                             <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-xs">
                               {reg.totalPeople || 0}
                             </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            {reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : "N/A"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-8">
                                  <Info className="h-3.5 w-3.5 mr-1" /> View List
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Devotee List</DialogTitle>
                                  <DialogDescription>
                                    Group members registered by {reg.userName}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4 space-y-2">
                                  {reg.devotees?.map((dev: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                                      <span className="font-medium">{dev.name}</span>
                                      <span className="text-xs bg-white px-2 py-1 rounded border">Age: {dev.age}</span>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No registrations found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volunteers">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Volunteers</CardTitle>
              </CardHeader>
              <CardContent>
                {volLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : allVolunteers && allVolunteers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allVolunteers.map((vol) => (
                        <TableRow key={vol.id}>
                          <TableCell>{vol.name}</TableCell>
                          <TableCell>{vol.phoneNumber}</TableCell>
                          <TableCell>
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {vol.areaOfService?.join(", ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            {vol.registrationDate ? new Date(vol.registrationDate).toLocaleDateString() : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No volunteers found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ... other tabs content ... */}
          <TabsContent value="live-darshan">
            <Card className="shadow-lg max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="text-primary" /> Live Darshan Settings
                </CardTitle>
                <CardDescription>Update the YouTube Live link for the devotees.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>YouTube Live Stream URL</Label>
                  <Input 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                  />
                </div>
                <Button onClick={handleUpdateLiveLink} className="w-full bg-primary hover:bg-primary/90">
                  Save Live Stream Link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blessings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Add Today's Darshan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input 
                      placeholder="Enter image URL" 
                      value={blessingImg}
                      onChange={(e) => setBlessingImg(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Blessing Date</Label>
                    <Input 
                      type="date" 
                      value={blessingDate}
                      onChange={(e) => setBlessingDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message/Caption</Label>
                    <Textarea 
                      placeholder="e.g. May Sai Baba guide your path..." 
                      value={blessingCaption}
                      onChange={(e) => setBlessingCaption(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddBlessing} className="w-full bg-primary">Add Photo</Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle>Recent Photos</CardTitle>
                </CardHeader>
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Preview</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blessings?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <img src={item.imageUrl} alt="Blessing" className="w-12 h-12 rounded object-cover" />
                          </TableCell>
                          <TableCell className="text-xs">{item.blessingDate}</TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="destructive" onClick={() => handleDeleteBlessing(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="setup">
            <Card className="shadow-lg max-w-4xl mx-auto border-accent/20">
              <CardHeader className="bg-accent/5">
                <CardTitle className="flex items-center gap-2 text-accent">
                  <ShieldCheck className="h-6 w-6" /> Platform Configuration
                </CardTitle>
                <CardDescription>Critical instructions for enabling all features.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" /> Automatic Email Setup
                  </h3>
                  <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Go to <strong>Extensions</strong> tab in Firebase Console.</li>
                      <li>Install <strong>Trigger Email</strong> by Firebase.</li>
                      <li>Set <strong>Email documents collection</strong> to <code>mail</code>.</li>
                      <li>Configure your <strong>SMTP connection URI</strong>.</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
