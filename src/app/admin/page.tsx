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
  Video,
  Sparkles,
  Loader2,
  AlertCircle,
  LogIn,
  LogOut,
  Mail,
  Lock,
  Info,
  ScanLine,
  QrCode,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Circle,
  Star,
  Plus,
  Settings,
  Image as ImageIcon,
  Wand2
} from "lucide-react";
import { 
  useAuth,
  useUser,
  useFirestore, 
  useDoc, 
  useCollection, 
  useMemoFirebase,
  setDocumentNonBlocking,
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
import { generateBlessing } from "@/ai/flows/generate-blessing-flow";

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
  const donorsRef = useMemoFirebase(() => (db && isActuallyAdmin) ? query(collection(db, "prominent_donors"), orderBy("displayOrder", "asc")) : null, [db, isActuallyAdmin]);
  
  const allRegistrationsQuery = useMemoFirebase(() => 
    (db && isActuallyAdmin) ? collectionGroup(db, "darshan_registrations") : null, 
  [db, isActuallyAdmin]);
  
  const allVolunteersQuery = useMemoFirebase(() => 
    (db && isActuallyAdmin) ? collectionGroup(db, "volunteers") : null, 
  [db, isActuallyAdmin]);

  const { data: config } = useDoc(configRef);
  const { data: blessings } = useCollection(blessingsRef);
  const { data: donors } = useCollection(donorsRef);
  const { data: allRegistrations, isLoading: regLoading } = useCollection(allRegistrationsQuery);
  const { data: allVolunteers, isLoading: volLoading } = useCollection(allVolunteersQuery);

  // Site Config states
  const [heroUrl, setHeroUrl] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [liveUrl, setLiveUrl] = useState("");

  // Blessing states
  const [blessingImg, setBlessingImg] = useState("");
  const [blessingCaption, setBlessingCaption] = useState("");
  const [blessingDate, setBlessingDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Donor states
  const [donorName, setDonorName] = useState("");
  const [donorCity, setDonorCity] = useState("");
  const [donorCategory, setDonorCategory] = useState("Premium Contributor");
  const [donorOrder, setDonorOrder] = useState("1");

  // Entry Check-in logic
  const [passCodeInput, setPassCodeInput] = useState("");
  const [foundRegistration, setFoundRegistration] = useState<any>(null);

  useEffect(() => {
    if (config) {
      setHeroUrl(config.heroImageUrl || "");
      setEventName(config.eventName || "Sai Paduka Mahotsav");
      setEventDate(config.eventDate || "2026-03-09");
      setOrganizerName(config.organizerName || "Sai Parivar Ambala");
      setLiveUrl(config.liveDarshanYoutubeLink || "");
    }
  }, [config]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign In Failed", description: error.message });
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleUpdateConfig = () => {
    if (!configRef) return;
    setDocumentNonBlocking(configRef, {
      heroImageUrl: heroUrl,
      eventName,
      eventDate,
      organizerName,
      liveDarshanYoutubeLink: liveUrl,
      lastUpdatedAt: new Date().toISOString()
    }, { merge: true });
    toast({ title: "Site Settings Updated", description: "The portal configuration has been saved successfully." });
  };

  const handleAiGenerateBlessing = async () => {
    setIsGeneratingAi(true);
    try {
      const aiMessage = await generateBlessing({});
      setBlessingCaption(aiMessage);
      toast({ title: "AI Message Generated", description: "Baba's divine message is ready." });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Could not generate message at this time." });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleAddBlessing = () => {
    if (!db || !blessingImg) {
       toast({ variant: "destructive", title: "Missing Image", description: "Please provide an image URL for the blessing." });
       return;
    }
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

  const handleAddDonor = () => {
    if (!db || !donorName) return;
    const donorsCol = collection(db, "prominent_donors");
    addDocumentNonBlocking(donorsCol, {
      name: donorName,
      city: donorCity,
      category: donorCategory,
      displayOrder: parseInt(donorOrder) || 1,
      createdAt: new Date().toISOString()
    });
    setDonorName("");
    setDonorCity("");
    toast({ title: "Donor Added", description: "Donor has been added to the Wall of Gratitude." });
  };

  const handleDeleteDonor = (id: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, "prominent_donors", id));
    toast({ title: "Removed", description: "Donor removed from list." });
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

  const handleIndividualCheckIn = (devoteeIndex: number) => {
    if (!foundRegistration || !db) return;
    
    const updatedDevotees = [...foundRegistration.devotees];
    updatedDevotees[devoteeIndex] = {
      ...updatedDevotees[devoteeIndex],
      isCheckedIn: true,
      checkInTime: new Date().toISOString()
    };

    const regRef = doc(db, "users", foundRegistration.externalAuthUserId, "darshan_registrations", foundRegistration.id);
    setDocumentNonBlocking(regRef, {
      devotees: updatedDevotees,
      isCheckedIn: true 
    }, { merge: true });

    setFoundRegistration({ ...foundRegistration, devotees: updatedDevotees, isCheckedIn: true });
    toast({ title: "Check-in Successful", description: `Entry recorded for ${updatedDevotees[devoteeIndex].name}.` });
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
          <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto p-1 bg-muted rounded-xl mb-8">
            <TabsTrigger value="entry-checkin" className="py-3">
              <ScanLine className="h-4 w-4 mr-2" /> Entry
            </TabsTrigger>
            <TabsTrigger value="registrations" className="py-3">
              <Users className="h-4 w-4 mr-2" /> Darshan
            </TabsTrigger>
            <TabsTrigger value="donors" className="py-3">
              <Star className="h-4 w-4 mr-2" /> Donors
            </TabsTrigger>
            <TabsTrigger value="blessings" className="py-3">
              <Sparkles className="h-4 w-4 mr-2" /> Blessings
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="py-3">
              <HandHeart className="h-4 w-4 mr-2" /> Volunteers
            </TabsTrigger>
            <TabsTrigger value="setup" className="py-3">
              <Settings className="h-4 w-4 mr-2" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entry-checkin">
             <div className="max-w-4xl mx-auto space-y-8">
                <Card className="shadow-lg border-primary/20">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <ScanLine className="text-primary" /> Venue Entry Check-in
                    </CardTitle>
                    <CardDescription>Verify devotee passes and record individual entry</CardDescription>
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
                      <Button onClick={handleSearchPass} className="h-12 px-8 bg-primary">Search</Button>
                    </div>

                    {foundRegistration && (
                      <Card className="mt-8 border-2 bg-primary/5 border-primary/20">
                        <div className="p-6">
                           <div className="flex justify-between items-start mb-6">
                              <div>
                                <h3 className="text-2xl font-bold">{foundRegistration.userName}</h3>
                                <p className="text-sm text-muted-foreground">{foundRegistration.userPhone}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] font-bold uppercase block mb-1">Pass Code</span>
                                <span className="text-lg font-bold font-mono text-primary">{foundRegistration.id.substring(0, 8).toUpperCase()}</span>
                              </div>
                           </div>
                           
                           <div className="space-y-4">
                              <h4 className="font-bold text-sm uppercase text-muted-foreground border-b pb-2">Devotee Check-in List ({foundRegistration.totalPeople})</h4>
                              <div className="grid grid-cols-1 gap-3">
                                 {foundRegistration.devotees?.map((dev: any, i: number) => (
                                   <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border shadow-sm">
                                      <div className="flex items-center gap-3">
                                         {dev.isCheckedIn ? (
                                           <CheckCircle2 className="h-6 w-6 text-green-600" />
                                         ) : (
                                           <Circle className="h-6 w-6 text-muted-foreground" />
                                         )}
                                         <div>
                                            <p className="font-bold text-lg">{dev.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">Age: {dev.age}</p>
                                         </div>
                                      </div>
                                      {dev.isCheckedIn ? (
                                        <div className="text-right">
                                           <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">ENTERED</span>
                                           {dev.checkInTime && <p className="text-[8px] mt-1">{new Date(dev.checkInTime).toLocaleTimeString()}</p>}
                                        </div>
                                      ) : (
                                        <Button 
                                          onClick={() => handleIndividualCheckIn(i)} 
                                          size="sm" 
                                          className="bg-primary hover:bg-primary/90 font-bold"
                                        >
                                          Confirm Entry
                                        </Button>
                                      )}
                                   </div>
                                 ))}
                              </div>
                           </div>
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
                        <TableHead>People</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allRegistrations.map((reg) => {
                        const checkedCount = reg.devotees?.filter((d: any) => d.isCheckedIn).length || 0;
                        const isFullyCheckedIn = checkedCount === reg.totalPeople;

                        return (
                          <TableRow key={reg.id}>
                            <TableCell className="font-medium">
                               <div>{reg.userName || "N/A"}</div>
                               <div className="text-[10px] text-muted-foreground font-mono">{reg.id.substring(0, 8).toUpperCase()}</div>
                            </TableCell>
                            <TableCell>
                              {isFullyCheckedIn ? (
                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">FULL ENTRY</span>
                              ) : checkedCount > 0 ? (
                                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">{checkedCount}/{reg.totalPeople} IN</span>
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
                                    <Info className="h-3.5 w-3.5 mr-1" /> Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Devotee List</DialogTitle>
                                    <DialogDescription>
                                      Contact: {reg.userName} ({reg.userPhone})
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="mt-4 space-y-2">
                                    {reg.devotees?.map((dev: any, idx: number) => (
                                      <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg border">
                                        <div>
                                           <span className="font-medium">{dev.name}</span>
                                           <span className="text-[10px] ml-2 opacity-60">Age: {dev.age}</span>
                                        </div>
                                        {dev.isCheckedIn ? (
                                          <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded">CHECKED IN</span>
                                        ) : (
                                          <span className="text-[10px] bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 rounded">PENDING</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No registrations found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Add Prominent Donor</CardTitle>
                  <CardDescription>Donors will appear on the Wall of Gratitude.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Donor Name</Label>
                    <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} placeholder="e.g. Sh. Rakesh Gupta" />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={donorCity} onChange={(e) => setDonorCity(e.target.value)} placeholder="e.g. Ambala City" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category/Honor</Label>
                    <Input value={donorCategory} onChange={(e) => setDonorCategory(e.target.value)} placeholder="e.g. Gold Member" />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Order (1 = Top)</Label>
                    <Input type="number" value={donorOrder} onChange={(e) => setDonorOrder(e.target.value)} />
                  </div>
                  <Button onClick={handleAddDonor} className="w-full bg-primary">
                    <Plus className="h-4 w-4 mr-2" /> Add to Wall
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle>Current Wall of Gratitude</CardTitle>
                </CardHeader>
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donors?.map((donor) => (
                        <TableRow key={donor.id}>
                          <TableCell className="font-bold">{donor.name}</TableCell>
                          <TableCell className="text-xs">{donor.category}</TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="destructive" onClick={() => handleDeleteDonor(donor.id)}>
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

          <TabsContent value="blessings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Add Today's Darshan</CardTitle>
                  <CardDescription>Upload a photo and add a sacred teaching.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Image URL (Required)</Label>
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
                    <div className="flex justify-between items-center mb-1">
                      <Label>Message/Caption (Hindi Only)</Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] font-bold h-6 gap-1 text-primary hover:bg-primary/10"
                        onClick={handleAiGenerateBlessing}
                        disabled={isGeneratingAi}
                      >
                        {isGeneratingAi ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                        Magic Hindi Teaching
                      </Button>
                    </div>
                    <Textarea 
                      placeholder="e.g. श्रद्धा और सबुरी। बाबा सदा तुम्हारे साथ हैं..." 
                      value={blessingCaption}
                      onChange={(e) => setBlessingCaption(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button onClick={handleAddBlessing} className="w-full bg-primary font-bold">Add to Divine Section</Button>
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

          <TabsContent value="setup">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-lg border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="text-primary" /> Site Configuration
                  </CardTitle>
                  <CardDescription>Manage global event settings and hero content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Hero Image URL</Label>
                    <Input 
                      placeholder="https://images.unsplash.com/..." 
                      value={heroUrl} 
                      onChange={(e) => setHeroUrl(e.target.value)} 
                    />
                    <p className="text-[10px] text-muted-foreground">This image appears behind the event title on the Home page.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Event Name</Label>
                    <Input value={eventName} onChange={(e) => setEventName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Event Date</Label>
                    <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Organizer Name</Label>
                    <Input value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Video className="h-4 w-4" /> YouTube Live Link</Label>
                    <Input value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />
                  </div>
                  <Button onClick={handleUpdateConfig} className="w-full bg-primary font-bold">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-accent/20">
                <CardHeader className="bg-accent/5">
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <ShieldCheck className="h-6 w-6" /> Platform Setup
                  </CardTitle>
                  <CardDescription>Instructions for enabling advanced features.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" /> Automatic Email Setup
                    </h3>
                    <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
                      <p className="text-xs text-muted-foreground mb-2">Enable the "Trigger Email" extension in Firebase Console to send registration confirmations.</p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Go to <strong>Extensions</strong> tab.</li>
                        <li>Install <strong>Trigger Email</strong>.</li>
                        <li>Collection: <code>mail</code>.</li>
                        <li>Configure SMTP URI.</li>
                      </ol>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
