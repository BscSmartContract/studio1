
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  PlayCircle, 
  ArrowRight
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

  const eventName = config?.eventName || "Sai Paduka Mahotsav";
  const eventDateRaw = config?.eventDate || "2026-03-09";
  const eventDateFormatted = new Date(eventDateRaw).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  // Sacred Vertical Portrait URL
  const sacredPortraitUrl = "https://images.unsplash.com/photo-1669631756612-1087033ecda2?q=80&w=1080";

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center overflow-hidden">
        {config?.heroImageUrl ? (
          <div className="absolute inset-0 z-0">
            <Image 
              src={config.heroImageUrl} 
              alt="Hero Background" 
              fill 
              className="object-cover opacity-20"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background/90 to-accent/5" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square opacity-20 pointer-events-none">
              <div className="w-full h-full rounded-full bg-gradient-radial from-primary/30 to-transparent blur-[120px]" />
            </div>
          </div>
        )}
        
        <div className="relative z-10 container px-4 py-20 flex flex-col items-center">
          <div className="inline-block px-5 py-2 mb-8 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-[0.3em] uppercase animate-in fade-in slide-in-from-top duration-1000 shadow-sm">
            Om Sai Ram
          </div>
          
          <div className="space-y-6 max-w-4xl">
            <h1 className="text-6xl md:text-9xl font-headline font-extrabold tracking-tighter text-foreground mb-4 drop-shadow-sm leading-none">
              {eventName.split(' ').slice(0, -1).join(' ')} <span className="text-primary">{eventName.split(' ').pop()}</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium italic tracking-wide">
              "Experience the divine footsteps of Shri Shirdi Sai Baba"
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-12 mb-12">
            <div className="flex items-center gap-2 bg-white/80 border border-primary/10 px-6 py-3 rounded-2xl shadow-sm backdrop-blur-sm">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">{eventDateFormatted}, {new Date(eventDateRaw).getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 border border-primary/10 px-6 py-3 rounded-2xl shadow-sm backdrop-blur-sm">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">Aggarwal Bhavan, Ambala</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white w-full h-16 text-xl font-bold rounded-3xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 border-none">
              <Link href="/darshan">Register for Darshan</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full h-16 text-lg font-bold rounded-3xl border-primary/20 hover:bg-primary/5 transition-all text-primary">
              <Link href="/live" className="flex items-center justify-center">
                <PlayCircle className="mr-2 h-6 w-6 text-accent animate-pulse" />
                Live Darshan
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Divine Presence Section - Optimized for Vertical Portrait */}
      <section className="py-24 bg-white relative">
        <div className="container px-4">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-12 bg-primary/30" />
                <span className="text-primary font-bold tracking-widest uppercase text-xs">Divine Presence</span>
                <div className="h-[1px] w-12 bg-primary/30" />
              </div>
              <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight">
                Daily Glimpse of <br /><span className="text-primary">Sacred Darshan</span>
              </h2>
            </div>

            <div className="flex flex-col items-center gap-12">
              <div className="w-full max-w-5xl space-y-8 text-center">
                {isBlessingLoading ? (
                  <Skeleton className="h-10 w-3/4 mx-auto rounded-xl" />
                ) : (
                  <div className="space-y-6">
                    <blockquote className="text-2xl md:text-4xl font-headline italic text-foreground font-medium leading-snug">
                      "{todayBlessing?.caption || "Shraddha and Saburi. Your faith will guide you to my door. Why fear when I am here?"}"
                    </blockquote>
                    <div className="flex items-center justify-center gap-4 bg-muted/30 p-4 rounded-3xl w-fit mx-auto">
                      <Calendar className="h-5 w-5 text-primary" />
                      <p className="text-sm font-bold">
                        {todayBlessing 
                          ? new Date(todayBlessing.blessingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                          : "Daily Divine Blessing"
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 
                SACRED PORTAL: Optimized for the vertical idol portrait.
                - object-cover ensures it fills the elegant frame.
                - Max width constrained for portrait orientation.
              */}
              <div className="relative w-full max-w-md aspect-[3/4] rounded-[3rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.15)] border-[12px] border-primary/5 bg-white group transition-all duration-700">
                <Image
                  src={todayBlessing?.imageUrl || sacredPortraitUrl}
                  alt="Shri Shirdi Sai Baba"
                  fill
                  unoptimized={true}
                  className="object-cover"
                  style={{ objectPosition: 'center top' }}
                  data-ai-hint="shirdi portrait"
                />
                {/* Decorative overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute top-8 right-8 p-3 bg-white/30 backdrop-blur-md rounded-2xl border border-white/40 z-10 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white rounded-full blur-[150px]" />
        </div>
        <div className="container px-4 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-headline font-bold mb-10 tracking-tight">Om Sai Ram</h2>
          <p className="text-xl md:text-2xl mb-14 max-w-3xl mx-auto opacity-90 leading-relaxed font-medium">
            Join the grand celebration. Register your family and friends to receive your digital entry pass instantly.
          </p>
          <div className="flex flex-col items-center gap-6">
            <Button asChild variant="secondary" size="lg" className="rounded-full px-16 h-20 text-2xl font-extrabold text-primary shadow-2xl hover:scale-105 transition-transform bg-white border-none">
              <Link href="/darshan">Secure Your Pass</Link>
            </Button>
            <p className="text-sm opacity-60 font-bold uppercase tracking-[0.2em]">Limited Entries for Morning Session</p>
          </div>
        </div>
      </section>
    </div>
  );
}
