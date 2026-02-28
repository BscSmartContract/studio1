"use client";

import { useState } from "react";
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
  Image as ImageIcon, 
  Settings, 
  Heart, 
  Star,
  Plus,
  Trash2
} from "lucide-react";

export default function AdminPanel() {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAdmin(true);
      toast({ title: "Logged In", description: "Welcome to Sai Paduka Admin Panel." });
    } else {
      toast({ variant: "destructive", title: "Invalid Credentials" });
    }
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

        <Tabs defaultValue="registrations" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1 bg-muted rounded-xl mb-8">
            <TabsTrigger value="registrations" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2 hidden sm:inline" /> Darshan
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <HandHeart className="h-4 w-4 mr-2 hidden sm:inline" /> Volunteers
            </TabsTrigger>
            <TabsTrigger value="donations" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Heart className="h-4 w-4 mr-2 hidden sm:inline" /> Donations
            </TabsTrigger>
            <TabsTrigger value="gallery" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <ImageIcon className="h-4 w-4 mr-2 hidden sm:inline" /> Gallery
            </TabsTrigger>
            <TabsTrigger value="settings" className="py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Settings className="h-4 w-4 mr-2 hidden sm:inline" /> Details
            </TabsTrigger>
          </TabsList>

          {/* Registrations Tab */}
          <TabsContent value="registrations">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Darshan Participants</CardTitle>
                <CardDescription>Registered devotees for 9th March.</CardDescription>
              </CardHeader>
              <CardContent>
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
                    <TableRow>
                      <TableCell className="font-mono">SAI-881</TableCell>
                      <TableCell>Amit Kumar</TableCell>
                      <TableCell>amit.k@gmail.com</TableCell>
                      <TableCell>Oct 24, 2024</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">SAI-882</TableCell>
                      <TableCell>Sonia Sharma</TableCell>
                      <TableCell>sonia.s@yahoo.com</TableCell>
                      <TableCell>Oct 25, 2024</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Service Area</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Rahul Singh</TableCell>
                      <TableCell>9876543210</TableCell>
                      <TableCell>Crowd Management</TableCell>
                      <TableCell><span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">Approved</span></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Priya Mehta</TableCell>
                      <TableCell>9012345678</TableCell>
                      <TableCell>Medical Help</TableCell>
                      <TableCell><span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-bold">Pending</span></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Manage Donation Purposes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>New Purpose Title</Label>
                    <Input placeholder="e.g. Bhandara" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Describe why this sewa is important..." />
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">Add Purpose</Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Prominent Donors List</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Donor Name</Label>
                    <Input placeholder="Enter name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contribution Level</Label>
                    <Input placeholder="e.g. Platinum Supporter" />
                  </div>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" /> Add to Wall of Gratitude
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Manage Photo Gallery</CardTitle>
                  <CardDescription>Upload or remove event photos.</CardDescription>
                </div>
                <Button className="bg-primary">Upload New Photo</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={`https://picsum.photos/seed/gall-${i}/200/200`} alt="Gallery item" className="object-cover w-full h-full" />
                      <button className="absolute top-1 right-1 p-1.5 bg-destructive text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="shadow-lg max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Event Details & Venue</CardTitle>
                <CardDescription>Edit the core event information visible on the website.</CardDescription>
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