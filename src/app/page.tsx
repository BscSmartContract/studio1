"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Sparkles, 
  PlayCircle, 
  ArrowRight,
  ImageIcon
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

  const galleryPreviewImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-')).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Refined Plain Hero Section with Spiritual Gradient Aura */}
      <section className="relative min-h-[85vh] flex items-center justify-center text-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5">
        {/* Subtle Decorative Aura Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square opacity-20 pointer-events-none">
          <div className="w-full h-full rounded-full bg-gradient-radial from-primary/40 to-transparent blur-[120px]" />
        </div>
        
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

      {/* Today's Blessing */}
      <section className="py-24 bg-white">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto space-y-16">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 order-2 lg:order-1">
                {isBlessingLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-20 w-3/4 rounded-xl" />
                  </div>
                ) : todayBlessing ? (
                  <div className="space-y-8">
                    <blockquote className="text-3xl md:text-4xl font-headline italic text-foreground font-medium leading-snug">
                      "{todayBlessing.caption || "Shraddha and Saburi. Your faith will guide you to my door."}"
                    </blockquote>
                    <div className="flex items-center gap-4 bg-muted/30 p-5 rounded-3xl w-fit">
                      <div className="p-4 bg-primary/10 rounded-2xl">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.15em] mb-1">Darshan Record</p>
                        <p className="text-lg font-bold">
                          {new Date(todayBlessing.blessingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-lg">Waiting for the daily divine sight...</p>
                )}
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-muted/20 bg-muted transition-transform duration-700 hover:scale-[1.01]">
                  {todayBlessing ? (
                    <Image
                      src={todayBlessing.imageUrl}
                      alt="Daily Blessing"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Sparkles className="h-16 w-16 text-primary/10" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Preview */}
      <section className="py-24 bg-muted/10">
        <div className="container px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-headline font-bold text-primary">Mahotsav Gallery</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Experience the spiritual energy of previous Mahotsavs and sacred ceremonies captured through our lens.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {galleryPreviewImages.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-[2rem] overflow-hidden group shadow-xl cursor-pointer">
                <Image
                  src={img.imageUrl}
                  alt={img.description}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint={img.imageHint}
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="bg-white/90 p-4 rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                    <ImageIcon className="text-primary h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="ghost" className="rounded-full px-10 h-14 text-primary font-bold text-lg hover:bg-primary/5">
              <Link href="/gallery">Explore Full Gallery <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-accent text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white rounded-full blur-[150px]" />
        </div>
        <div className="container px-4 relative z-10 text-center">
          <h2 className="text-5xl md:text-7xl font-headline font-bold mb-10 tracking-tight">Om Sai Ram</h2>
          <p className="text-xl md:text-2xl mb-14 max-w-3xl mx-auto opacity-90 leading-relaxed font-medium">
            Join the grand celebration. Register your family and friends to receive your digital entry pass instantly.
          </p>
          <div className="flex flex-col items-center gap-6">
            <Button asChild variant="secondary" size="lg" className="rounded-full px-16 h-20 text-2xl font-extrabold text-accent shadow-2xl hover:scale-105 transition-transform bg-white border-none">
              <Link href="/darshan">Secure Your Pass</Link>
            </Button>
            <p className="text-sm opacity-60 font-bold uppercase tracking-[0.2em]">Limited Entries for Morning Session</p>
          </div>
        </div>
      </section>
    </div>
  );
}
