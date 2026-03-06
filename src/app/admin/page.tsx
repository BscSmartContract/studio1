
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  HandHeart, 
  Sparkles,
  Loader2,
  AlertCircle,
  LogIn,
  LogOut,
  Mail,
  Lock,
  Trash2,
  Star,
  Plus,
  Settings,
  Image as ImageIcon,
  Wand2,
  BellRing,
  ShieldCheck
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
  const subscribersRef = useMemoFirebase(() => (db && isActuallyAdmin) ? query(collection(db, "subscribers"), orderBy("subscribedAt", "desc")) : null, [db, isActuallyAdmin]);
  
  const allVolunteersQuery = useMemoFirebase(() => 
    (db && isActuallyAdmin) ? collectionGroup(db, "volunteers") : null, 
  [db, isActuallyAdmin]);

  const { data: config } = useDoc(configRef);
  const { data: blessings } = useCollection(blessingsRef);
  const { data: donors } = useCollection(donorsRef);
  const { data: subscribers, isLoading: subLoading } = useCollection(subscribersRef);
  const { data: allVolunteers, isLoading: volLoading } = useCollection(allVolunteersQuery);

  // Site Config states
  const [heroUrl, setHeroUrl] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [organizerName, setOrganizerName] = useState("");

  // Blessing states
  const [blessingImg, setBlessingImg] = useState("");
  const [blessingCaption, setBlessingCaption] = useState("");
  const [blessingDate, setBlessingDate] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Donor states
  const [donorName, setDonorName] = useState("");
  const [donorCity, setDonorCity] = useState("");
  const [donorCategory, setDonorCategory] = useState("Premium Contributor");
  const [donorOrder, setDonorOrder] = useState("1");

  useEffect(() => {
    if (config) {
      setHeroUrl(config.heroImageUrl || "");
      setEventName(config.eventName || "Sai Paduka Mahotsav");
      setEventDate(config.eventDate || "2026-03-09");
      setOrganizerName(config.organizerName || "Sai Parivar Ambala");
    }
  }, [config]);

  useEffect(() => {
    setBlessingDate(new Date().toISOString().split('T')[0]);
  }, []);

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

  const handleDeleteSubscriber = (id: string) => {
    if (!db) return;
    deleteDocumentNonBlocking(doc(db, "subscribers", id));
    toast({ title: "Removed", description: "Subscriber removed." });
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

        <Tabs defaultValue="volunteers" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1 bg-muted rounded-xl mb-8">
            <TabsTrigger value="volunteers" className="py-3">
              <HandHeart className="h-4 w-4 mr-2" /> Volunteers
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="py-3">
              <BellRing className="h-4 w-4 mr-2" /> Stay Tuned
            </TabsTrigger>
            <TabsTrigger value="donors" className="py-3">
              <Star className="h-4 w-4 mr-2" /> Donors
            </TabsTrigger>
            <TabsTrigger value="blessings" className="py-3">
              <Sparkles className="h-4 w-4 mr-2" /> Blessings
            </TabsTrigger>
            <TabsTrigger value="setup" className="py-3">
              <Settings className="h-4 w-4 mr-2" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="volunteers">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Volunteers</CardTitle>
                <CardDescription>List of devotees who signed up for service.</CardDescription>
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
                          <TableCell className="font-bold">{vol.name}</TableCell>
                          <TableCell>{vol.phoneNumber}</TableCell>
                          <TableCell>
                            <span className="text-xs bg-muted px-2 py-1 rounded font-medium">
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

          <TabsContent value="subscribers">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Stay Tuned Subscribers</CardTitle>
                <CardDescription>Devotees waiting for upcoming event alerts.</CardDescription>
              </CardHeader>
              <CardContent>
                {subLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : subscribers && subscribers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-bold">{sub.name}</TableCell>
                          <TableCell>{sub.email}</TableCell>
                          <TableCell>{sub.phone || "-"}</TableCell>
                          <TableCell className="text-xs">
                            {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                             <Button size="icon" variant="ghost" onClick={() => handleDeleteSubscriber(sub.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No subscribers yet.</p>
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
                  <CardTitle>Daily Divine Messages</CardTitle>
                  <CardDescription>Upload photos and add sacred teachings.</CardDescription>
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
                    <div className="flex justify-between items-center mb-1">
                      <Label>Message/Caption (Hindi)</Label>
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
                  <Button onClick={handleAddBlessing} className="w-full bg-primary font-bold">Add Blessing</Button>
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
                  <Button onClick={handleUpdateConfig} className="w-full bg-primary font-bold">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-accent/20">
                <CardHeader className="bg-accent/5">
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <ShieldCheck className="h-6 w-6" /> Platform Security
                  </CardTitle>
                  <CardDescription>Current administration setup status.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" /> Email Service (Brevo)
                    </h3>
                    <p className="text-sm text-muted-foreground">The platform is configured to send divine Hindi emails via Brevo. Ensure your sender address is verified.</p>
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
