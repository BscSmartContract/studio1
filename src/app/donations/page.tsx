
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Star, Sparkles, IndianRupee, Loader2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

const donationPurposes = [
  {
    title: "Event Arrangements",
    description: "Support venue booking, tentage, and seating arrangements for thousands of devotees.",
    icon: <Sparkles className="h-6 w-6 text-primary" />,
  },
  {
    title: "Bhandara (Community Meal)",
    description: "Help us serve holy Prasad and meals to all attendees throughout the day.",
    icon: <Heart className="h-6 w-6 text-accent" />,
  },
  {
    title: "Spiritual Decor",
    description: "Contribute to the floral decoration and lighting of the Sai Paduka sanctum.",
    icon: <Star className="h-6 w-6 text-yellow-500" />,
  },
];

export default function DonationsPage() {
  const db = useFirestore();

  const donorsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "prominent_donors"), orderBy("displayOrder", "asc"));
  }, [db]);

  const { data: donors, isLoading: isDonorsLoading } = useCollection(donorsQuery);

  return (
    <div className="py-12 md:py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Donation & Seva</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your generous contributions help us organize this divine event and serve the community. 
            Every donation, no matter the size, makes a difference.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Donation Purposes */}
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <IndianRupee className="text-primary" /> Donation Purposes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {donationPurposes.map((purpose, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow rounded-2xl">
                  <CardHeader className="pb-2">
                    <div className="bg-muted p-3 rounded-lg w-fit mb-2">
                      {purpose.icon}
                    </div>
                    <CardTitle className="text-xl">{purpose.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{purpose.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-primary/5 border-primary/20 p-12 text-center space-y-6 rounded-[2rem] shadow-xl">
              <h3 className="text-3xl font-bold">General Donation</h3>
              <p className="text-muted-foreground">For bank transfers and direct UPI donations, please use the details below.</p>
              <div className="bg-white p-8 rounded-3xl shadow-inner border border-border inline-block min-w-[350px]">
                <p className="font-bold text-xl mb-1">Account Holder: Sai Parivar Ambala</p>
                <p className="text-sm">Account No: 01234567890123</p>
                <p className="text-sm">IFSC: SBIN0001234</p>
                <div className="mt-6 pt-6 border-t border-border">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2 font-bold">Scan to Pay (UPI)</span>
                  <span className="text-2xl font-bold text-primary">saipadav@upi</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Prominent Donors Column */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="text-yellow-500" /> Prominent Donors
            </h2>
            <Card className="shadow-2xl border-primary/10 overflow-hidden rounded-[2rem]">
              <div className="bg-primary py-6 px-6 text-white font-bold text-center text-xl">
                Wall of Gratitude
              </div>
              <div className="max-h-[600px] overflow-y-auto divide-y divide-border custom-scrollbar">
                {isDonorsLoading ? (
                  <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
                ) : donors && donors.length > 0 ? (
                  donors.map((donor) => (
                    <div key={donor.id} className="p-6 hover:bg-muted/50 transition-colors">
                      <p className="font-bold text-xl">{donor.name}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{donor.city}</p>
                      <div className="mt-3 inline-block px-4 py-1.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                        {donor.category}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground italic text-sm">
                    No prominent donors listed yet. 
                  </div>
                )}
              </div>
              <div className="p-8 text-center bg-muted/20 border-t">
                <p className="text-sm text-muted-foreground italic leading-relaxed">"One who gives to the poor and needy, gives to me."</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
