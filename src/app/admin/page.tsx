
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
  LogOut
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

export default function AdminPanel() {
  const { toast } = useToast();
  const db = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading: authLoading } = useUser();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState("");

  // Firebase Refs - only initialize if unlocked to avoid permission errors
  const configRef = useMemoFirebase(() => (db && isUnlocked) ? doc(db, "app_configuration", "main") : null, [db, isUnlocked]);
  const blessingsRef = useMemoFirebase(() => (db && isUnlocked) ? query(collection(db, "daily_blessing_photos"), orderBy("blessingDate", "desc")) : null, [db, isUnlocked]);
  
  // Collection Group queries for all nested registrations
  const allRegistrationsQuery = useMemoFirebase(() => (db && isUnlocked) ? collectionGroup(db, "darshan_registrations") : null, [db, isUnlocked]);
  const allVolunteersQuery = useMemoFirebase(() => (db && isUnlocked) ? collectionGroup(db, "volunteers") : null, [db, isUnlocked]);

  // Data fetching
  const { data: config } = useDoc(configRef);
  const { data: blessings } = useCollection(blessingsRef);
  const { data: allRegistrations, isLoading: regLoading, error: regError } = useCollection(allRegistrationsQuery);
  const { data: allVolunteers, isLoading: volLoading } = useCollection(allVolunteersQuery);

  // Form states
  const [liveUrl, setLiveUrl] = useState("");
  const [blessingImg, setBlessingImg] = useState("");
  const [blessingCaption, setBlessingCaption] = useState("");
  const [blessingDate, setBlessingDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (config) {
      setLiveUrl(config.liveDarshanYoutubeLink || "");
    }
  }, [config]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsUnlocked(true);
      toast({ title: "Panel Unlocked", description: "You now have access to administrative tools." });
    } else {
      toast({ variant: "destructive", title: "Invalid Password" });
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Signed In", description: "Identity verified via Google." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign In Failed", description: error.message });
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsUnlocked(false);
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
            <CardTitle className="text-3xl font-headline">Admin Login</CardTitle>
            <CardDescription>Sign in with Google to verify your identity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGoogleSignIn} className="w-full h-12 flex items-center gap-2">
              <LogIn className="h-4 w-4" /> Sign in with Google
            </Button>
            <p className="text-[10px] text-center text-muted-foreground">
              Note: Your email must be registered in the roles_admin collection to view data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <Card className="w-full max-w-md shadow-2xl border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="text-primary h-6 w-6" />
            </div>
            <CardTitle className="text-3xl font-headline">Unlock Panel</CardTitle>
            <CardDescription>Enter the administrative password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pass">Password</Label>
                <Input 
                  id="pass" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Unlock</Button>
              <Button variant="ghost" onClick={handleSignOut} className="w-full text-xs">
                Not {user.email}? Sign out
              </Button>
            </form>
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
            <p className="text-muted-foreground">Logged in as {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsUnlocked(false)}>Lock Panel</Button>
            <Button variant="ghost" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
          </div>
        </div>

        {regError && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Permission Denied: Your account ({user.email}) is not authorized as an Admin in Firestore. Check the Setup Guide.</span>
          </div>
        )}

        <Tabs defaultValue="live-darshan" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-7 h-auto p-1 bg-muted rounded-xl mb-8">
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
            <TabsTrigger value="settings" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Settings className="h-4 w-4 mr-2" /> Details
            </TabsTrigger>
            <TabsTrigger value="setup" className="py-3 data-[state=active]:bg-accent data-[state=active]:text-white">
              <ShieldCheck className="h-4 w-4 mr-2" /> Setup Guide
            </TabsTrigger>
          </TabsList>

          {/* Setup Guide Tab */}
          <TabsContent value="setup">
            <Card className="shadow-lg max-w-4xl mx-auto border-accent/20">
              <CardHeader className="bg-accent/5">
                <CardTitle className="flex items-center gap-2 text-accent">
                  <AlertCircle className="h-6 w-6" /> Required Administrative Setup
                </CardTitle>
                <CardDescription className="text-foreground">Follow these steps to fully enable data management.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2">Step 1: Grant Database Privileges</h3>
                  <p className="text-sm text-muted-foreground">Even after logging in, Firestore requires you to be listed in the <code>roles_admin</code> collection for security.</p>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <ol className="text-sm list-decimal pl-5 space-y-1">
                      <li>Go to <strong>Build &gt; Firestore Database</strong> in the console.</li>
                      <li>Click <strong>"Start collection"</strong>.</li>
                      <li>Collection ID: <code>roles_admin</code></li>
                      <li>Document ID: <code>{user.uid}</code> (Copy this value)</li>
                      <li>Add a field: <code>uid</code> (string) = <code>{user.uid}</code></li>
                      <li>Click <strong>Save</strong>.</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> Authentication Settings
                  </h3>
                  <p className="text-sm mb-4">If you haven't enabled Google Login yet, click below.</p>
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90" asChild>
                    <a href={`https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-2851341323-b12c8'}/authentication/providers`} target="_blank">
                      Open Authentication Console
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Darshan Tab */}
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
                  <p className="text-[10px] text-muted-foreground">Example: https://www.youtube.com/watch?v=VIDEO_ID</p>
                </div>
                <Button onClick={handleUpdateLiveLink} className="w-full bg-primary hover:bg-primary/90">
                  Save Live Stream Link
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Blessings Tab */}
          <TabsContent value="blessings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Add Today's Darshan</CardTitle>
                  <CardDescription>Upload photo and message for the "Blessing Column".</CardDescription>
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
                  <Button onClick={handleAddBlessing} className="w-full bg-primary">Add to Blessings Column</Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle>Recent Blessings</CardTitle>
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
                          <TableCell className="text-xs font-mono">{item.blessingDate}</TableCell>
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

          {/* Registrations Tab */}
          <TabsContent value="registrations">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Darshan Participants</CardTitle>
                <CardDescription>Devotees registered for the event.</CardDescription>
              </CardHeader>
              <CardContent>
                {regLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : allRegistrations && allRegistrations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Registration ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allRegistrations.map((reg) => (
                        <TableRow key={reg.id}>
                          <TableCell className="font-mono text-xs">SAI-{reg.id.substring(0,8).toUpperCase()}</TableCell>
                          <TableCell>{reg.userName || "N/A"}</TableCell>
                          <TableCell>{reg.userEmail || "N/A"}</TableCell>
                          <TableCell className="text-xs">
                            {reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No registrations found yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Volunteers Tab */}
          <TabsContent value="volunteers">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Event Volunteers</CardTitle>
                <CardDescription>People who signed up to serve.</CardDescription>
              </CardHeader>
              <CardContent>
                {volLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : allVolunteers && allVolunteers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Service Area</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allVolunteers.map((vol) => (
                        <TableRow key={vol.id}>
                          <TableCell>{vol.name}</TableCell>
                          <TableCell className="text-xs">{vol.email}</TableCell>
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
                  <p className="text-center text-muted-foreground py-8">No volunteers found yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="donations" className="text-center py-12 text-muted-foreground">
             Donation management feature coming soon.
          </TabsContent>
          
          <TabsContent value="settings" className="text-center py-12 text-muted-foreground">
             Event settings feature coming soon.
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
