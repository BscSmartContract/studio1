
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

  const heroFallback = "https://images.unsplash.com/photo-1669631756612-1087033ecda2?q=80&w=2000";
  const heroImg = config?.heroImageUrl || heroFallback;
  const eventName = config?.eventName || "Sai Paduka Mahotsav";
  const eventDateRaw = config?.eventDate || "2026-03-09";
  const eventDateFormatted = new Date(eventDateRaw).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  const galleryPreviewImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-')).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center overflow-hidden">
        <Image
          src={heroImg}
          alt="Shirdi Sai Baba"
          fill
          className="object-cover brightness-[0.4] object-top"
          priority
          data-ai-hint="shirdi sai"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background" />
        <div className="relative z-10 container px-4 py-20 flex flex-col items-center">
          <div className="inline-block px-5 py-1.5 mb-6 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-white text-xs font-bold tracking-[0.2em] uppercase">
            Om Sai Ram
          </div>
          <h1 className="text-5xl md:text-8xl font-headline font-extrabold text-white mb-6 drop-shadow-lg leading-tight">
            {eventName.split(' ').slice(0, -1).join(' ')} <span className="text-primary italic">{eventName.split(' ').pop()}</span>
          </h1>
          
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-white/90 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{eventDateFormatted}, {new Date(eventDateRaw).getFullYear()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Aggarwal Bhavan</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>9:00 AM Onwards</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white w-full h-14 text-lg font-bold rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 border-none">
              <Link href="/darshan">Register Now</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:text-primary hover:bg-white/10 w-full h-12 text-base font-medium transition-all">
              <Link href="/live" className="flex items-center">
                <PlayCircle className="mr-2 h-5 w-5 text-accent animate-pulse" />
                Live Darshan
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Today's Blessing */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="h-px w-8 bg-primary opacity-50" />
                <span className="text-primary font-bold tracking-widest uppercase text-xs">Sacred Moments</span>
                <div className="h-px w-8 bg-primary opacity-50" />
              </div>
              <h2 className="text-3xl md:text-5xl font-headline font-bold leading-tight">
                Daily Glimpse of <br /><span className="text-primary">Divine Grace</span>
              </h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                Start your day with the blessed sight of the Padukas. We share real-time updates and sacred photography from the event venue.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 order-2 lg:order-1">
                {isBlessingLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-3/4" />
                  </div>
                ) : todayBlessing ? (
                  <div className="space-y-8">
                    <p className="text-2xl md:text-3xl font-headline italic text-primary font-medium leading-relaxed">
                      "{todayBlessing.caption || "Shraddha and Saburi. Your faith will guide you to my door."}"
                    </p>
                    <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-2xl w-fit">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Darshan for</p>
                        <p className="text-base font-bold">
                          {new Date(todayBlessing.blessingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">Waiting for the divine sight of the day...</p>
                )}
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-[8px] border-white bg-muted rotate-2 hover:rotate-0 transition-transform duration-500">
                  {todayBlessing ? (
                    <Image
                      src={todayBlessing.imageUrl}
                      alt="Daily Blessing"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Sparkles className="h-12 w-12 text-primary/20" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Details Cards */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-none shadow-md rounded-3xl p-6 text-center group hover:bg-primary transition-colors duration-300">
              <CardContent className="pt-4 space-y-4">
                <div className="p-4 bg-primary/10 rounded-2xl inline-block group-hover:bg-white/20">
                  <Calendar className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold group-hover:text-white">{eventDateFormatted}</h3>
                  <p className="text-muted-foreground text-sm group-hover:text-white/80">Special Mahotsav</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md rounded-3xl p-6 text-center group hover:bg-primary transition-colors duration-300">
              <CardContent className="pt-4 space-y-4">
                <div className="p-4 bg-primary/10 rounded-2xl inline-block group-hover:bg-white/20">
                  <MapPin className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold group-hover:text-white">Aggarwal Bhavan</h3>
                  <p className="text-muted-foreground text-sm group-hover:text-white/80">Ambala City</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md rounded-3xl p-6 text-center group hover:bg-primary transition-colors duration-300">
              <CardContent className="pt-4 space-y-4">
                <div className="p-4 bg-primary/10 rounded-2xl inline-block group-hover:bg-white/20">
                  <Clock className="h-8 w-8 text-primary group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold group-hover:text-white">9:00 AM</h3>
                  <p className="text-muted-foreground text-sm group-hover:text-white/80">Starts with Aarti</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Photo Gallery Preview */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-headline font-bold text-primary">Photo Gallery</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
              Glimpses of past events and divine moments. Experience the spiritual energy captured through our lens.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {galleryPreviewImages.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group shadow-lg cursor-pointer">
                <Image
                  src={img.imageUrl}
                  alt={img.description}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  data-ai-hint={img.imageHint}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon className="text-white h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline" className="rounded-full px-8 h-12">
              <Link href="/gallery">View Full Gallery <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-accent text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-[120px]" />
        </div>
        <div className="container px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-headline font-bold mb-8">Ready for Darshan?</h2>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto opacity-90 leading-relaxed">
            Register your group and get your digital pass instantly. Limited entries available for the morning session.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button asChild variant="secondary" size="lg" className="rounded-full px-12 h-16 text-xl font-bold text-accent shadow-2xl hover:scale-105 transition-transform bg-white border-none">
              <Link href="/darshan">Register Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
