import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Star, Sparkles, IndianRupee } from "lucide-react";

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

const prominentDonors = [
  { name: "Smt. Shanti Devi", city: "Ambala City", amount: "Premium Contributor" },
  { name: "Sh. Rakesh Gupta", city: "Chandigarh", amount: "Platinum Supporter" },
  { name: "Sai Sewa Samiti", city: "Delhi", amount: "Grand Patron" },
  { name: "Aggarwal Family", city: "Ambala Cantt", amount: "Gold Member" },
];

export default function DonationsPage() {
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
                <Card key={idx} className="hover:shadow-md transition-shadow">
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
            
            <Card className="bg-primary/5 border-primary/20 p-8 text-center space-y-6">
              <h3 className="text-2xl font-bold">General Donation</h3>
              <p className="text-muted-foreground">For bank transfers and direct UPI donations, please use the details below.</p>
              <div className="bg-white p-6 rounded-xl shadow-inner border border-border inline-block min-w-[300px]">
                <p className="font-bold text-lg mb-1">Account Holder: Sai Parivar Ambala</p>
                <p className="text-sm">Account No: 01234567890123</p>
                <p className="text-sm">IFSC: SBIN0001234</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">UPI ID</span>
                  <span className="text-xl font-bold text-primary">saipadav@upi</span>
                </div>
              </div>
              <div>
                <Button className="bg-primary hover:bg-primary/90 rounded-full px-10 h-12">Contact for Donation Receipt</Button>
              </div>
            </Card>
          </div>

          {/* Prominent Donors Column */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="text-yellow-500" /> Prominent Donors
            </h2>
            <Card className="shadow-lg border-primary/10 overflow-hidden">
              <div className="bg-primary py-4 px-6 text-white font-bold text-center">
                Wall of Gratitude
              </div>
              <div className="divide-y divide-border">
                {prominentDonors.map((donor, idx) => (
                  <div key={idx} className="p-4 hover:bg-muted/50 transition-colors">
                    <p className="font-bold text-lg">{donor.name}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{donor.city}</p>
                    <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full uppercase">
                      {donor.amount}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 text-center bg-muted/20">
                <p className="text-sm text-muted-foreground italic">"One who gives to the poor and needy, gives to me."</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}