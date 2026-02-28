
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
import { PlaceHolderImages } from "@/lib/placeholder-images";

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

  // Get specific placeholders from library
  const heroPlaceholder = PlaceHolderImages.find(img => img.id === 'hero-bg')?.imageUrl || "";
  const portraitPlaceholder = PlaceHolderImages.find(img => img.id === 'sai-v-portrait')?.imageUrl || "";

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src={config?.heroImageUrl || heroPlaceholder} 
            alt="Hero Background" 
            fill 
            className="object-cover opacity-40 scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
        </div>
        
        <div className="relative z-10 container px-4 py-20 flex flex-col items-center">
          <div className="inline-block px-6 py-2 mb-8 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground font-bold tracking-[0.4em] uppercase animate-in fade-in slide-in-from-top duration-1000 shadow-xl backdrop-blur-md">
            Om Sai Ram
          </div>
          
          <div className="space-y-6 max-w-4xl">
            <h1 className="text-6xl md:text-9xl font-headline font-extrabold tracking-tighter text-foreground mb-4 drop-shadow-2xl leading-none">
              {eventName.split(' ').slice(0, -1).join(' ')} <span className="text-primary">{eventName.split(' ').pop()}</span>
            </h1>
            <p className="text-xl md:text-3xl text-foreground/80 font-medium italic tracking-wide drop-shadow-md">
              "Experience the divine footsteps of Shri Shirdi Sai Baba"
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-12 mb-12">
            <div className="flex items-center gap-3 bg-white/90 border border-primary/20 px-8 py-4 rounded-2xl shadow-lg backdrop-blur-md transition-transform hover:scale-105">
              <Calendar className="h-6 w-6 text-primary" />
              <span className="font-bold text-foreground text-lg">{eventDateFormatted}, {new Date(eventDateRaw).getFullYear()}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/90 border border-primary/20 px-8 py-4 rounded-2xl shadow-lg backdrop-blur-md transition-transform hover:scale-105">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="font-bold text-foreground text-lg">Aggarwal Bhavan, Ambala</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-2xl">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white w-full h-20 text-2xl font-bold rounded-full shadow-2xl shadow-primary/40 transition-all hover:scale-[1.05] active:scale-95 border-none">
              <Link href="/darshan">Register for Darshan</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full h-20 text-xl font-bold rounded-full border-primary/30 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all text-primary">
              <Link href="/live" className="flex items-center justify-center">
                <PlayCircle className="mr-3 h-8 w-8 text-accent animate-pulse" />
                Live Darshan
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Divine Presence Section - Optimized for FULL Vertical Portrait */}
      <section className="py-24 bg-white relative">
        <div className="container px-4">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-16 bg-primary/30" />
                <span className="text-primary font-bold tracking-widest uppercase text-sm">Divine Presence</span>
                <div className="h-[1px] w-16 bg-primary/30" />
              </div>
              <h2 className="text-5xl md:text-7xl font-headline font-bold leading-tight">
                Daily Glimpse of <br /><span className="text-primary">Sacred Darshan</span>
              </h2>
            </div>

            <div className="flex flex-col items-center gap-12">
              <div className="w-full max-w-5xl space-y-8 text-center">
                {isBlessingLoading ? (
                  <Skeleton className="h-10 w-3/4 mx-auto rounded-xl" />
                ) : (
                  <div className="space-y-6">
                    <blockquote className="text-3xl md:text-5xl font-headline italic text-foreground font-medium leading-snug">
                      "{todayBlessing?.caption || "Shraddha and Saburi. Your faith will guide you to my door. Why fear when I am here?"}"
                    </blockquote>
                    <div className="flex items-center justify-center gap-4 bg-primary/5 p-4 rounded-full w-fit mx-auto border border-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                      <p className="text-sm font-bold text-primary uppercase tracking-widest">
                        {todayBlessing 
                          ? new Date(todayBlessing.blessingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                          : "Eternal Divine Blessing"
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 
                THE SACRED FRAME: 
                - Using aspect-ratio and object-contain to ENSURE NO CROPPING.
                - Max-height ensures the image doesn't blow up too much but stays tall.
              */}
              <div className="relative w-full max-w-2xl bg-muted/20 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border-[16px] border-primary/5 group transition-all duration-700 hover:shadow-primary/20">
                <div className="aspect-[2/3] relative w-full h-full min-h-[600px] md:min-h-[800px]">
                  <Image
                    src={todayBlessing?.imageUrl || portraitPlaceholder}
                    alt="Shri Shirdi Sai Baba"
                    fill
                    unoptimized={true}
                    className="object-contain p-4 md:p-8"
                    priority
                    data-ai-hint="shirdi portrait"
                  />
                  {/* Decorative corner elements */}
                  <div className="absolute top-10 right-10 p-4 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 z-10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                  <div className="absolute bottom-10 left-10 p-4 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 z-10 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl pb-0.5">ॐ</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-white rounded-full blur-[180px]" />
        </div>
        <div className="container px-4 relative z-10 text-center">
          <h2 className="text-6xl md:text-8xl font-headline font-bold mb-10 tracking-tighter">Om Sai Ram</h2>
          <p className="text-2xl md:text-3xl mb-16 max-w-4xl mx-auto opacity-90 leading-relaxed font-medium drop-shadow-sm">
            Join the grand celebration. Register your family and friends to receive your digital entry pass instantly and join the divine journey.
          </p>
          <div className="flex flex-col items-center gap-8">
            <Button asChild variant="secondary" size="lg" className="rounded-full px-20 h-24 text-3xl font-extrabold text-primary shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform bg-white border-none active:scale-95">
              <Link href="/darshan">Secure Your Pass</Link>
            </Button>
            <p className="text-base opacity-70 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Limited Entries Available <Sparkles className="h-5 w-5" />
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
