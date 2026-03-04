
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar as CalendarIcon, MapPin, Sparkles, Footprints, Utensils, Music } from "lucide-react";

const scheduleItems = [
  {
    time: "09:00 AM",
    event: "Sacred Welcome & Kakad Aarti",
    hindi: "श्री गणेश पूजन एवं काकड़ आरती",
    icon: <Sparkles className="h-5 w-5 text-primary" />,
    description: "The divine start of the Mahotsav with sacred chants and lighting of the lamp."
  },
  {
    time: "10:30 AM",
    event: "Grand Palki Yatra",
    hindi: "भव्य पालकी यात्रा",
    icon: <Footprints className="h-5 w-5 text-accent" />,
    description: "The footprints of Shri Sai Baba will be taken around the venue in a spiritual procession."
  },
  {
    time: "12:00 PM",
    event: "Madhyan Aarti",
    hindi: "दोपहर की आरती",
    icon: <Clock className="h-5 w-5 text-primary" />,
    description: "Offering prayers and collective singing of Sai Baba's glory at high noon."
  },
  {
    time: "01:00 PM",
    event: "Mahaprasad (Bhandara)",
    hindi: "विशाल भण्डारा (महाप्रसाद)",
    icon: <Utensils className="h-5 w-5 text-green-600" />,
    description: "Holy Prasad will be served to all devotees at the main dining hall."
  },
  {
    time: "04:30 PM",
    event: "Bhajan Sandhya",
    hindi: "मधुर भजन संध्या",
    icon: <Music className="h-5 w-5 text-accent" />,
    description: "Soul-stirring devotional music performance by renowned Sai singers."
  },
  {
    time: "07:00 PM",
    event: "Dhoop Aarti",
    hindi: "धूप आरती",
    icon: <Sparkles className="h-5 w-5 text-primary" />,
    description: "Evening rituals as the sun sets, filling the atmosphere with spiritual incense."
  },
  {
    time: "08:30 PM",
    event: "Shej Aarti",
    hindi: "सेज आरती",
    icon: <Clock className="h-5 w-5 text-primary" />,
    description: "The final Aarti of the day, requesting Baba to rest and grant peace to all."
  }
];

export default function EventsPage() {
  return (
    <div className="py-12 md:py-24 bg-background">
      <div className="container px-4 mx-auto max-w-4xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            Mahotsav Program
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">Event Schedule</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto italic">
            "जब मैं यहाँ हूँ तो डर किस बात का?" — Shri Sai Baba
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <Card className="border-primary/20 shadow-xl overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-primary text-white text-center py-8">
              <div className="flex items-center justify-center gap-4 mb-2">
                <CalendarIcon className="h-6 w-6" />
                <CardTitle className="text-2xl font-bold">Sunday, 9th March 2026</CardTitle>
              </div>
              <p className="opacity-90 flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" /> Aggarwal Bhavan, Ambala City
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {scheduleItems.map((item, idx) => (
                  <div key={idx} className="p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:bg-muted/30 transition-colors">
                    <div className="md:w-32 shrink-0 flex flex-col justify-center">
                      <span className="text-primary font-bold text-xl">{item.time}</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Standard Time</span>
                    </div>
                    <div className="flex-grow space-y-2">
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <h3 className="text-xl font-bold text-foreground">{item.event}</h3>
                      </div>
                      <p className="text-primary font-bold text-lg">{item.hindi}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/30 p-8 rounded-[2rem] border border-dashed border-primary/20 text-center space-y-4">
             <h3 className="font-bold text-lg">Special Note for Devotees</h3>
             <p className="text-sm text-muted-foreground leading-relaxed">
               Please ensure you arrive at least 30 minutes before the Aarti timings to secure a place in the main hall. 
               The Palki Yatra will commence exactly at 10:30 AM from the main gate. 
             </p>
             <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
               <span>Shraddha</span>
               <div className="h-1 w-1 bg-primary rounded-full" />
               <span>Saburi</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
