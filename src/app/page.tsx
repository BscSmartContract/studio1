
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  PlayCircle 
} from "lucide-react";
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const db = useFirestore();

  // Fetch Global Configuration
  const configRef = useMemoFirebase(() => db ? doc(db, "app_configuration", "main") : null, [db]);
  const { data: config } = useDoc(configRef);

  // Fetch Latest Blessing
  const blessingsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "daily_blessing_photos"),
      orderBy("blessingDate", "desc"),
      limit(1)
    );
  }, [db]);

  const { data: latestBlessings, isLoading: isBlessingLoading } = useCollection(blessingsQuery);
  const todayBlessing = latestBlessings?.[0];

  const [eventDateFormatted, setEventDateFormatted] = useState("");
  const [eventYear, setEventYear] = useState("");
  
  const eventName = config?.eventName || "Sai Paduka Mahotsav";

  useEffect(() => {
    const raw = config?.eventDate || "2026-03-09";
    const date = new Date(raw);
    setEventDateFormatted(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }));
    setEventYear(date.getFullYear().toString());
  }, [config]);

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section - Plain Background */}
      <section className="relative min-h-[80vh] flex items-center justify-center text-center overflow-hidden bg-muted/30">
        <div className="relative z-10 container px-4 py-20 flex flex-col items-center">
          <div className="inline-block px-6 py-2 mb-8 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold tracking-[0.4em] uppercase shadow-sm">
            Om Sai Ram
          </div>
          
          <div className="space-y-6 max-w-4xl">
            <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter text-foreground mb-4 leading-none">
              {eventName.split(' ').slice(0, -1).join(' ')} <span className="text-primary">{eventName.split(' ').pop()}</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium italic tracking-wide">
              "Experience the divine footsteps of Shri Shirdi Sai Baba"
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-12 mb-12">
            <div className="flex items-center gap-3 bg-white border border-border px-8 py-4 rounded-2xl shadow-sm">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="font-bold text-foreground text-lg">{eventDateFormatted}{eventYear ? `, ${eventYear}` : ""}</span>
            </div>
            <div className="flex items-center gap-3 bg-white border border-border px-8 py-4 rounded-2xl shadow-sm">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="font-bold text-foreground text-lg">Aggarwal Bhavan, Ambala</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-2xl">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white w-full h-16 text-xl font-bold rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Link href="/darshan">Darshan</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full h-16 text-lg font-bold rounded-full border-primary/30 bg-white hover:bg-muted transition-all text-primary">
              <Link href="/live" className="flex items-center justify-center">
                <PlayCircle className="mr-2 h-6 w-6 text-accent" />
                Live Darshan
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Divine Presence Section - Clean Text Only */}
      <section className="py-24 bg-white">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-12 bg-primary/20" />
                <span className="text-primary font-bold tracking-widest uppercase text-xs">Divine Presence</span>
                <div className="h-[1px] w-12 bg-primary/20" />
              </div>
              <h2 className="text-4xl md:text-5xl font-headline font-bold">
                Daily Glimpse of <span className="text-primary">Sacred Darshan</span>
              </h2>
            </div>

            <div className="space-y-8">
              {isBlessingLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                  <Skeleton className="h-8 w-1/2 mx-auto" />
                </div>
              ) : (
                <div className="space-y-8">
                  <blockquote className="text-2xl md:text-4xl font-headline italic text-foreground font-medium leading-relaxed px-4">
                    "{todayBlessing?.caption || "श्रद्धा और सबुरी। तुम्हारा विश्वास तुम्हें मेरे द्वार तक लाएगा। जब मैं यहाँ हूँ तो डर किस बात का?"}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-4 bg-primary/5 p-4 rounded-full w-fit mx-auto border border-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">
                      {todayBlessing 
                        ? new Date(todayBlessing.blessingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                        : "Eternal Divine Blessing"
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-12">
              <div className="h-px w-24 bg-primary/20 mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-white relative">
        <div className="container px-4 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-headline font-bold mb-8 tracking-tighter">Om Sai Ram</h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 leading-relaxed font-medium">
            Join the grand celebration. Access your digital entry pass instantly and join the divine journey.
          </p>
          <div className="flex flex-col items-center gap-6">
            <Button asChild variant="secondary" size="lg" className="rounded-full px-12 h-20 text-2xl font-extrabold text-primary shadow-xl bg-white hover:scale-105 transition-transform">
              <Link href="/darshan">Darshan</Link>
            </Button>
            <p className="text-sm opacity-70 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Shraddha • Saburi <Sparkles className="h-4 w-4" />
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
