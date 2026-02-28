
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
  Info
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

  useEffect(() => {
    if (config) {
      setLiveUrl(config.liveDarshanYoutubeLink || "");
    }
  }, [config]);

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
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
              Authorized Personnel Only
            </p>
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
            <div className="p-3 bg-muted rounded border text-xs font-mono break-all flex items-center justify-between gap-2">
              <span>UID: {user.uid}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(user.uid)}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
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

        <Tabs defaultValue="live-darshan" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 h-auto p-1 bg-muted rounded-xl mb-8">
            <TabsTrigger value="live-darshan" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Video className="h-4 w-4 mr-2" /> Live
            </TabsTrigger>
            <TabsTrigger value="blessings" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Sparkles className="h-4 w-4 mr-2" /> Blessings
            </TabsTrigger>
            <TabsTrigger value="registrations" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" /> Darshan
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <HandHeart className="h-4 w-4 mr-2" /> Volunteers
            </TabsTrigger>
            <TabsTrigger value="donations" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Heart className="h-4 w-4 mr-2" /> Donations
            </TabsTrigger>
            <TabsTrigger value="setup" className="py-3 data-[state=active]:bg-accent data-[state=active]:text-white">
              <ShieldCheck className="h-4 w-4 mr-2" /> Setup Guide
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <Card className="shadow-lg max-w-4xl mx-auto border-accent/20">
              <CardHeader className="bg-accent/5">
                <CardTitle className="flex items-center gap-2 text-accent">
                  <ShieldCheck className="h-6 w-6" /> Platform Configuration
                </CardTitle>
                <CardDescription className="text-foreground font-medium">Critical instructions for enabling all features.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> 1. Authorized Domains
                  </h3>
                  <p className="text-sm text-muted-foreground">Firebase blocks login links from unknown domains. Add the current URL.</p>
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <p className="text-xs font-mono break-all bg-white p-2 rounded border">Hostname: <strong>{typeof window !== 'undefined' ? window.location.hostname : 'loading...'}</strong></p>
                    <ol className="text-sm list-decimal pl-5 space-y-1">
                      <li>Go to <strong>Authentication &gt; Settings</strong> tab in Firebase Console.</li>
                      <li>Select <strong>Authorized domains</strong>.</li>
                      <li>Click <strong>Add domain</strong> and paste the hostname above.</li>
                    </ol>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <a href={`https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-2851341323-b12c8'}/authentication/settings`} target="_blank">
                        <ExternalLink className="h-3 w-3 mr-2" /> Open Auth Settings
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" /> 2. Branding Emails
                  </h3>
                  <p className="text-sm text-muted-foreground">Make the magic links look professional:</p>
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <ol className="text-sm list-decimal pl-5 space-y-2">
                      <li>Go to <strong>Authentication &gt; Templates</strong> in Firebase Console.</li>
                      <li>Update <strong>Sender name</strong> to <code>Sai Parivar Ambala</code>.</li>
                      <li>Click <strong>Save</strong>.</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                        <TableHead>Phone</TableHead>
                        <TableHead>Total People</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allRegistrations.map((reg) => (
                        <TableRow key={reg.id}>
                          <TableCell className="font-medium">{reg.userName || "N/A"}</TableCell>
                          <TableCell>{reg.userPhone || "N/A"}</TableCell>
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
          
          <TabsContent value="donations" className="text-center py-12 text-muted-foreground">
             Feature coming soon.
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
