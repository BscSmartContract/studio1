
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
          src={heroImg?.imageUrl || "https://picsum.photos/seed/sai-baba-throne/1920/1080"}
          alt="Shirdi Sai Baba on Golden Throne"
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

      {/* Today's Blessing / Daily Darshan Section */}
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
                  Start your day with the blessed sight of the Padukas. We share real-time updates and sacred photography from the event venue to keep your soul connected with Sai's presence.
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
                    <Button asChild variant="outline" className="rounded-full px-8 h-12 hover:bg-primary hover:text-white border-primary text-primary transition-all">
                      <Link href="/gallery" className="flex items-center gap-2">Explore Gallery <Star className="h-4 w-4" /></Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="p-8 bg-muted/30 rounded-3xl border-dashed border-2 border-muted flex flex-col items-center text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">Wait for the divine sight... No blessing uploaded yet today.</p>
                </div>
              )}
            </div>

            <div className="flex-1 order-1 lg:order-2 w-full max-w-lg mx-auto">
              {isBlessingLoading ? (
                <Skeleton className="aspect-[3/4] rounded-[3rem]" />
              ) : todayBlessing ? (
                <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(229,137,26,0.3)] border-[12px] border-white group">
                  <Image
                    src={todayBlessing.imageUrl}
                    alt="Daily Blessing"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10">
                    <span className="text-primary font-bold tracking-widest uppercase text-xs mb-2">Shri Sai Sansthan</span>
                    <span className="text-white text-3xl font-bold font-headline">The Sacred Paduka</span>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white bg-muted">
                  <Image
                    src="https://picsum.photos/seed/sai-paduka-fallback/800/1200"
                    alt="Sacred Placeholder"
                    fill
                    className="object-cover opacity-50 grayscale"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-20 w-20 text-white/20" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Event Details Section */}
      <section className="py-24 bg-muted/40 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="container px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-headline font-bold mb-6 text-foreground">A Day of Devotion</h2>
            <div className="w-20 h-1.5 bg-primary mx-auto rounded-full"></div>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">Plan your visit to the Mahotsav. Every second spent in the presence of the Padukas is a step toward spiritual bliss.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] bg-card hover:translate-y-[-8px] transition-all duration-300 rounded-[2rem] group overflow-hidden">
              <CardContent className="pt-10 flex flex-col items-center text-center p-8">
                <div className="p-5 bg-primary/10 rounded-3xl mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Calendar className="h-10 w-10 text-primary transition-colors group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Divine Date</h3>
                <p className="text-lg text-muted-foreground font-medium">Sunday, 9th March</p>
                <div className="mt-4 px-4 py-1.5 bg-accent/10 rounded-full text-accent font-bold text-sm">Save the Date</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] bg-card hover:translate-y-[-8px] transition-all duration-300 rounded-[2rem] group overflow-hidden">
              <CardContent className="pt-10 flex flex-col items-center text-center p-8">
                <div className="p-5 bg-primary/10 rounded-3xl mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                  <MapPin className="h-10 w-10 text-primary transition-colors group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Sacred Venue</h3>
                <p className="text-lg text-muted-foreground font-medium">Aggarwal Bhavan</p>
                <p className="text-muted-foreground">Railway Station Area, Ambala</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.08)] bg-card hover:translate-y-[-8px] transition-all duration-300 rounded-[2rem] group overflow-hidden">
              <CardContent className="pt-10 flex flex-col items-center text-center p-8">
                <div className="p-5 bg-primary/10 rounded-3xl mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Clock className="h-10 w-10 text-primary transition-colors group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Holy Schedule</h3>
                <p className="text-lg text-muted-foreground font-medium">9:00 AM Onwards</p>
                <p className="text-sm mt-3 text-accent font-bold bg-accent/5 px-4 py-1 rounded-full">Prasad starts at 1 PM</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Organizer Section */}
      <section className="py-24 bg-background overflow-hidden">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center gap-20">
            <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-left duration-1000">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-headline font-bold text-foreground leading-tight">Serving the Divine with <br /><span className="text-primary underline decoration-accent/30 underline-offset-8">Sai Parivar Ambala</span></h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  We are a dedicated group of devotees committed to spreading Shirdi Sai Baba's message of Shraddha (Faith) and Saburi (Patience). Our mission is to serve every devotee with the same love that Baba showered upon humanity.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 py-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-accent/10 rounded-lg"><Heart className="h-6 w-6 text-accent" /></div>
                    <span className="font-bold text-xl">10+ Years</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-11">Of Spiritual Service</p>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><Users className="h-6 w-6 text-primary" /></div>
                    <span className="font-bold text-xl">500+ Members</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-11">Volunteering for Good</p>
                </div>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90 rounded-full px-12 h-14 text-lg shadow-xl shadow-primary/20">
                <Link href="/contact" className="flex items-center gap-2">Get in Touch <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="flex-1 relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.15)] border-[15px] border-white transition-transform hover:scale-105 duration-500">
              <Image
                src={venueImg?.imageUrl || "https://picsum.photos/seed/ambala-venue/800/600"}
                alt="Venue Image"
                fill
                className="object-cover"
                data-ai-hint="building hall"
              />
              <div className="absolute top-8 right-8 p-4 bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-primary/20">
                <div className="text-primary font-bold text-sm mb-1 uppercase tracking-widest">Main Hall</div>
                <div className="font-headline font-bold text-lg">Aggarwal Bhavan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-accent text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Star className="w-96 h-96 rotate-45" />
        </div>
        <div className="absolute -bottom-20 -left-20 p-12 opacity-10 pointer-events-none">
          <Sparkles className="w-80 h-80" />
        </div>
        
        <div className="container px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-headline font-bold mb-8 drop-shadow-md">Step into the Divine Aura</h2>
          <p className="text-2xl opacity-90 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            Your presence is what makes this Mahotsav special. Register now to secure your darshan pass and join us in serving the community.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Button asChild variant="secondary" size="lg" className="rounded-full px-12 h-16 text-xl font-bold text-accent shadow-2xl hover:scale-105 transition-transform bg-white border-none">
              <Link href="/donations">Make an Offering</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-12 h-16 text-xl font-bold border-2 border-white text-white hover:bg-white/10 shadow-2xl hover:scale-105 transition-transform">
              <Link href="/volunteer">Serve as Volunteer</Link>
            </Button>
          </div>
          <div className="mt-16 flex items-center justify-center gap-2 opacity-70">
            <div className="h-px w-12 bg-white/40" />
            <span className="text-sm font-bold tracking-widest uppercase">Om Sai Ram</span>
            <div className="h-px w-12 bg-white/40" />
          </div>
        </div>
      </section>
    </div>
  );
}
