
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
  Heart, 
  Users, 
  Star, 
  Sparkles, 
  PlayCircle, 
  ArrowRight 
} from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const db = useFirestore();
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-bg');
  const venueImg = PlaceHolderImages.find(img => img.id === 'event-venue');

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

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[95vh] flex items-center justify-center text-center overflow-hidden">
        <Image
          src={heroImg?.imageUrl || "https://images.unsplash.com/photo-1669631756612-1087033ecda2?q=80&w=2000"}
          alt="Shirdi Sai Baba"
          fill
          className="object-cover brightness-[0.4] object-top"
          priority
          data-ai-hint="shirdi sai"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-background" />
        <div className="relative z-10 container px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-block px-6 py-2 mb-8 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 text-primary-foreground text-sm font-bold tracking-[0.2em] uppercase">
            Om Sai Ram
          </div>
          <h1 className="text-5xl md:text-8xl font-headline font-extrabold text-white mb-6 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)] leading-tight">
            Sai Paduka <span className="text-primary italic">Mahotsav</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
            Join the sacred gathering of Sai Parivar Ambala. Experience the divine grace of Shirdi Sai Baba's Original Padukas in an atmosphere of ultimate peace and devotion.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white min-w-[240px] h-16 text-xl rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 border-none">
              <Link href="/darshan">Get Your Entry Pass</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/40 backdrop-blur-md min-w-[240px] h-16 text-xl rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95">
              <Link href="/live" className="flex items-center">
                <PlayCircle className="mr-3 h-6 w-6 text-accent animate-pulse" />
                Live Darshan
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Today's Blessing */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="container px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1 space-y-8 order-2 lg:order-1">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-1 w-12 bg-primary rounded-full" />
                  <span className="text-primary font-bold tracking-widest uppercase text-sm">Sacred Moments</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">
                  Daily Glimpse of <br /><span className="text-primary">Divine Grace</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Start your day with the blessed sight of the Padukas. We share real-time updates and sacred photography from the event venue.
                </p>
              </div>

              {isBlessingLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : todayBlessing ? (
                <Card className="border-none shadow-none bg-transparent">
                  <CardContent className="p-0 space-y-6">
                    <p className="text-3xl font-headline italic text-primary font-medium leading-relaxed">
                      "{todayBlessing.caption || "Shraddha and Saburi. Your faith will guide you to my door."}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground">Blessing for</p>
                        <p className="text-base font-bold">{new Date(todayBlessing.blessingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-muted-foreground">Waiting for the divine sight of the day...</p>
              )}
            </div>

            <div className="flex-1 order-1 lg:order-2 w-full max-w-lg mx-auto">
              <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white bg-muted">
                {todayBlessing ? (
                  <Image
                    src={todayBlessing.imageUrl}
                    alt="Daily Blessing"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Sparkles className="h-20 w-20 text-white/20" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-24 bg-muted/40">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Card className="border-none shadow-lg rounded-[2rem] text-center p-8 group hover:translate-y-[-5px] transition-all">
              <CardContent className="pt-6">
                <div className="p-5 bg-primary/10 rounded-2xl mb-6 inline-block group-hover:bg-primary group-hover:text-white transition-colors">
                  <Calendar className="h-10 w-10 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">9th March</h3>
                <p className="text-muted-foreground">Sunday Mahotsav</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-[2rem] text-center p-8 group hover:translate-y-[-5px] transition-all">
              <CardContent className="pt-6">
                <div className="p-5 bg-primary/10 rounded-2xl mb-6 inline-block group-hover:bg-primary group-hover:text-white transition-colors">
                  <MapPin className="h-10 w-10 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Aggarwal Bhavan</h3>
                <p className="text-muted-foreground">Ambala City</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-[2rem] text-center p-8 group hover:translate-y-[-5px] transition-all">
              <CardContent className="pt-6">
                <div className="p-5 bg-primary/10 rounded-2xl mb-6 inline-block group-hover:bg-primary group-hover:text-white transition-colors">
                  <Clock className="h-10 w-10 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">9:00 AM</h3>
                <p className="text-muted-foreground">Starts with Aarti</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-accent text-white text-center">
        <div className="container px-4">
          <h2 className="text-4xl md:text-6xl font-headline font-bold mb-8">Ready for Darshan?</h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
            Register your group and get your digital pass instantly. Limited entries available for the morning session.
          </p>
          <Button asChild variant="secondary" size="lg" className="rounded-full px-12 h-16 text-xl font-bold text-accent shadow-2xl hover:scale-105 transition-transform bg-white border-none">
            <Link href="/darshan">Register Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
