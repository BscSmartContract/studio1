
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
  Edit3,
  Copy
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

  // Admin Verification
  const adminDocRef = useMemoFirebase(() => (db && user) ? doc(db, "roles_admin", user.uid) : null, [db, user]);
  const { data: adminDoc, isLoading: isAdminCheckLoading } = useDoc(adminDocRef);
  const isActuallyAdmin = !!adminDoc;

  // Conditional Queries
  const configRef = useMemoFirebase(() => (db && isUnlocked) ? doc(db, "app_configuration", "main") : null, [db, isUnlocked]);
  const blessingsRef = useMemoFirebase(() => (db && isUnlocked) ? query(collection(db, "daily_blessing_photos"), orderBy("blessingDate", "desc")) : null, [db, isUnlocked]);
  
  // These queries are only enabled if the user is unlocked AND verified as an admin in Firestore
  const allRegistrationsQuery = useMemoFirebase(() => 
    (db && isUnlocked && isActuallyAdmin) ? collectionGroup(db, "darshan_registrations") : null, 
  [db, isUnlocked, isActuallyAdmin]);
  
  const allVolunteersQuery = useMemoFirebase(() => 
    (db && isUnlocked && isActuallyAdmin) ? collectionGroup(db, "volunteers") : null, 
  [db, isUnlocked, isActuallyAdmin]);

  const { data: config } = useDoc(configRef);
  const { data: blessings } = useCollection(blessingsRef);
  const { data: allRegistrations, isLoading: regLoading, error: regError } = useCollection(allRegistrationsQuery);
  const { data: allVolunteers, isLoading: volLoading, error: volError } = useCollection(allVolunteersQuery);

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

  const copyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      toast({ title: "Copied", description: "UID copied to clipboard." });
    }
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

  if (authLoading || isAdminCheckLoading) {
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
          <CardContent className="space-y-6">
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
            </form>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Your Unique UID (Required for Firestore Setup)</p>
              <div className="flex items-center gap-2">
                <code className="bg-background px-2 py-1 rounded border text-xs flex-grow truncate">{user.uid}</code>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={copyUid}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <Button variant="ghost" onClick={handleSignOut} className="w-full text-xs">
              Not {user.email}? Sign out
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
            <p className="text-muted-foreground">Logged in as {user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsUnlocked(false)}>Lock Panel</Button>
            <Button variant="ghost" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
          </div>
        </div>

        {(!isActuallyAdmin || regError || volError) && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <div className="flex-grow">
              <p className="font-bold">Admin Privileges Required</p>
              <p>Your account ({user.email}) is authenticated but not yet authorized as an Admin in Firestore.</p>
              <p className="mt-1 font-medium">To fix this, add your UID to the <code>roles_admin</code> collection in the Firebase Console.</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="bg-destructive/5 px-2 py-0.5 rounded border border-destructive/20 text-xs font-mono">{user.uid}</code>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copyUid}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
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

          <TabsContent value="setup">
            <Card className="shadow-lg max-w-4xl mx-auto border-accent/20">
              <CardHeader className="bg-accent/5">
                <CardTitle className="flex items-center gap-2 text-accent">
                  <ShieldCheck className="h-6 w-6" /> System Configuration Guide
                </CardTitle>
                <CardDescription className="text-foreground font-medium">Follow these steps to ensure the portal runs smoothly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                
                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> 1. Grant Database Privileges (Fixes Permissions Error)
                  </h3>
                  <p className="text-sm text-muted-foreground">Firestore requires you to be listed in the <code>roles_admin</code> collection to view registration data.</p>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <ol className="text-sm list-decimal pl-5 space-y-2">
                      <li>Go to <strong>Build &gt; Firestore Database</strong> in the console.</li>
                      <li>Click <strong>"Start collection"</strong>.</li>
                      <li>Collection ID: <code>roles_admin</code></li>
                      <li>Document ID: <code>{user.uid}</code></li>
                      <li>Add a field: <code>uid</code> (string) = <code>{user.uid}</code></li>
                      <li>Click <strong>Save</strong>.</li>
                    </ol>
                    <div className="mt-4 p-3 bg-primary/5 rounded border border-primary/20">
                      <p className="text-xs font-bold text-primary mb-1">Your UID for step 1.4:</p>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono">{user.uid}</code>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copyUid}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" /> 2. Clean User Emails (Customizing the Link)
                  </h3>
                  <p className="text-sm text-muted-foreground">To make the email sent to users look clean and professional (Subject & Body):</p>
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <ol className="text-sm list-decimal pl-5 space-y-2">
                      <li>Go to <strong>Authentication &gt; Templates</strong> in the console.</li>
                      <li>Select the <strong>"Email address verification"</strong> or <strong>"Passwordless sign-in"</strong> template.</li>
                      <li>Click the <strong>Edit (pencil) icon</strong>.</li>
                      <li>Change the <strong>Sender name</strong> to <code>Sai Parivar Ambala</code>.</li>
                      <li>Update the <strong>Subject</strong> and <strong>Message</strong> to your liking.</li>
                      <li>Click <strong>Save</strong>.</li>
                    </ol>
                    <Button size="sm" variant="outline" className="w-full mt-2" asChild>
                      <a href={`https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-2851341323-b12c8'}/authentication/templates`} target="_blank">
                        <ExternalLink className="h-3 w-3 mr-2" /> Open Email Templates
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2">
                    <LogIn className="h-5 w-5 text-primary" /> 3. Domain Whitelisting
                  </h3>
                  <p className="text-sm text-muted-foreground">Firebase blocks login links from unknown domains. You must add the current URL to the authorized list.</p>
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <p className="text-xs font-mono break-all">Current Hostname: <strong>{typeof window !== 'undefined' ? window.location.hostname : 'loading...'}</strong></p>
                    <ol className="text-sm list-decimal pl-5 space-y-1">
                      <li>Go to <strong>Authentication &gt; Settings</strong> tab.</li>
                      <li>Select <strong>"Authorized domains"</strong>.</li>
                      <li>Click <strong>"Add domain"</strong>.</li>
                      <li>Paste the hostname above and click <strong>Add</strong>.</li>
                    </ol>
                    <Button size="sm" variant="outline" className="w-full" asChild>
                      <a href={`https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-2851341323-b12c8'}/authentication/providers`} target="_blank">
                        <ExternalLink className="h-3 w-3 mr-2" /> Open Settings
                      </a>
                    </Button>
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
                  <p className="text-[10px] text-muted-foreground">Example: https://www.youtube.com/watch?v=VIDEO_ID</p>
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

          <TabsContent value="registrations">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Darshan Participants</CardTitle>
                <CardDescription>Devotees registered for the event.</CardDescription>
              </CardHeader>
              <CardContent>
                {!isActuallyAdmin ? (
                  <p className="text-center text-muted-foreground py-8">Complete Admin Setup to view registrations.</p>
                ) : regLoading ? (
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

          <TabsContent value="volunteers">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Event Volunteers</CardTitle>
                <CardDescription>People who signed up to serve.</CardDescription>
              </CardHeader>
              <CardContent>
                {!isActuallyAdmin ? (
                  <p className="text-center text-muted-foreground py-8">Complete Admin Setup to view volunteers.</p>
                ) : volLoading ? (
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
