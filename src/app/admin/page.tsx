
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
  ShieldCheck
} from "lucide-react";
import { 
  useFirestore, 
  useDoc, 
  useCollection, 
  useMemoFirebase,
  updateDocumentNonBlocking,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking
} from "@/firebase";
import { doc, collection, collectionGroup, query, orderBy } from "firebase/firestore";

export default function AdminPanel() {
  const { toast } = useToast();
  const db = useFirestore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");

  // Firebase Refs
  const configRef = useMemoFirebase(() => db ? doc(db, "app_configuration", "main") : null, [db]);
  const blessingsRef = useMemoFirebase(() => db ? query(collection(db, "daily_blessing_photos"), orderBy("blessingDate", "desc")) : null, [db]);
  
  // Collection Group queries for all nested registrations
  const allRegistrationsQuery = useMemoFirebase(() => db ? collectionGroup(db, "darshan_registrations") : null, [db]);
  const allVolunteersQuery = useMemoFirebase(() => db ? collectionGroup(db, "volunteers") : null, [db]);

  // Data fetching
  const { data: config } = useDoc(configRef);
  const { data: blessings } = useCollection(blessingsRef);
  const { data: allRegistrations, isLoading: regLoading } = useCollection(allRegistrationsQuery);
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
      setIsAdmin(true);
      toast({ title: "Logged In", description: "Welcome to Sai Paduka Admin Panel." });
    } else {
      toast({ variant: "destructive", title: "Invalid Credentials" });
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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <Card className="w-full max-w-md shadow-2xl border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Admin Access</CardTitle>
            <CardDescription>Enter admin password to continue</CardDescription>
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
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Unlock Panel</Button>
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
            <p className="text-muted-foreground">Manage Sai Paduka event registrations and content.</p>
          </div>
          <Button variant="outline" onClick={() => setIsAdmin(false)}>Logout</Button>
        </div>

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
                  <AlertCircle className="h-6 w-6" /> Google Authentication Setup Guide
                </CardTitle>
                <CardDescription className="text-foreground">Follow these steps to enable Google Login for your devotees.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">Step 1: Open Firebase Console</h3>
                    <p className="text-sm text-muted-foreground">Go to your project dashboard on the Firebase website.</p>
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <a href="https://console.firebase.google.com/" target="_blank">
                        Open Firebase Console <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">Step 2: Find the "Build" Menu</h3>
                    <p className="text-sm text-muted-foreground">On the left sidebar, look for the <strong>Build</strong> category. Click it to expand.</p>
                    <div className="p-3 bg-muted rounded border text-xs font-mono">
                      Sidebar {" > "} Build {" > "} Authentication
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">Step 3: Enable Google Provider</h3>
                    <p className="text-sm text-muted-foreground">Click <strong>Authentication</strong>, then the <strong>Sign-in method</strong> tab.</p>
                    <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>Click "Add new provider"</li>
                      <li>Select "Google"</li>
                      <li>Enable it and select your support email</li>
                      <li>Click "Save"</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">Step 4: CRITICAL - Authorized Domains</h3>
                    <p className="text-sm text-muted-foreground">In Authentication, click the <strong>Settings</strong> tab, then <strong>Authorized domains</strong>.</p>
                    <p className="text-sm text-muted-foreground">Ensure your current website URL (the one you see in the browser address bar) is added here. If it's not listed, Google will block the login.</p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <p className="text-sm font-medium">Common Login Issue: "auth/unauthorized-domain"</p>
                  <p className="text-xs text-muted-foreground mt-1">If devotees see an error saying the domain is unauthorized, it means you haven't completed Step 4 above. Firebase only allows logins from domains you specifically list for security reasons.</p>
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

          {/* Donations Tab (UI Only for now) */}
          <TabsContent value="donations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Manage Donation Purposes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  Feature coming soon to manage dynamic purposes.
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Prominent Donors List</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                  Feature coming soon to manage donor recognition.
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="shadow-lg max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Event Details & Venue</CardTitle>
                <CardDescription>Core event information management.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Venue Address</Label>
                  <Textarea defaultValue="Aggarwal Bhavan, Ambala City" />
                </div>
                <div className="space-y-2">
                  <Label>Google Maps Iframe URL</Label>
                  <Input placeholder="https://www.google.com/maps/embed?..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Date</Label>
                    <Input type="text" defaultValue="9th March" />
                  </div>
                  <div className="space-y-2">
                    <Label>Event Name</Label>
                    <Input type="text" defaultValue="Sai Paduka Event" />
                  </div>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 h-12">Save All Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
