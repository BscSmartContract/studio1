import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Calendar, MapPin, Clock, Heart, Users, Star } from "lucide-react";

export default function Home() {
  const heroImg = PlaceHolderImages.find(img => img.id === 'hero-bg');
  const venueImg = PlaceHolderImages.find(img => img.id === 'event-venue');

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center text-center overflow-hidden">
        <Image
          src={heroImg?.imageUrl || "https://picsum.photos/seed/sai-hero/1920/1080"}
          alt="Hero Background"
          fill
          className="object-cover brightness-[0.4]"
          priority
          data-ai-hint="spiritual saffron"
        />
        <div className="relative z-10 container px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary-foreground text-sm font-medium tracking-wider">
            OM SAI RAM
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold text-white mb-6 drop-shadow-lg">
            Sai Paduka <span className="text-primary">Event</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience the divine presence of Shirdi Sai Baba's Padukas. 
            Join Sai Parivar Ambala for a day of worship and spiritual awakening.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white min-w-[200px] h-14 text-lg rounded-full">
              <Link href="/darshan">Register for Darshan</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md min-w-[200px] h-14 text-lg rounded-full">
              <Link href="/volunteer">Become a Volunteer</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Event Details Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4 text-foreground">Event Information</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-xl bg-muted/50 hover:bg-muted transition-colors">
              <CardContent className="pt-8 flex flex-col items-center text-center">
                <div className="p-4 bg-primary/10 rounded-2xl mb-6">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Date</h3>
                <p className="text-muted-foreground">Sunday, 9th March</p>
                <p className="text-sm mt-2 text-accent font-medium">Mark your calendars!</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-muted/50 hover:bg-muted transition-colors">
              <CardContent className="pt-8 flex flex-col items-center text-center">
                <div className="p-4 bg-primary/10 rounded-2xl mb-6">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Location</h3>
                <p className="text-muted-foreground">Aggarwal Bhavan</p>
                <p className="text-muted-foreground">Ambala, Haryana</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-muted/50 hover:bg-muted transition-colors">
              <CardContent className="pt-8 flex flex-col items-center text-center">
                <div className="p-4 bg-primary/10 rounded-2xl mb-6">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Timing</h3>
                <p className="text-muted-foreground">9:00 AM onwards</p>
                <p className="text-sm mt-2 text-accent font-medium">Bhandara starts at 1:00 PM</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Organizer Section */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground">Organized by Sai Parivar Ambala</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Sai Parivar Ambala is a community dedicated to spreading the message of Love, Faith, and Patience. 
                We organize various spiritual and social activities including Bhandaras, medical camps, and education support.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center space-x-3">
                  <Heart className="h-5 w-5 text-accent" />
                  <span className="font-medium">10+ Years of Service</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-accent" />
                  <span className="font-medium">500+ Active Members</span>
                </div>
              </div>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/contact">Learn More & Contact Us</Link>
              </Button>
            </div>
            <div className="flex-1 relative w-full aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <Image
                src={venueImg?.imageUrl || "https://picsum.photos/seed/venue/800/600"}
                alt="Venue Image"
                fill
                className="object-cover"
                data-ai-hint="building hall"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Star className="w-64 h-64 rotate-45" />
        </div>
        <div className="container px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-headline font-bold mb-6">Be a Part of the Divine Journey</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
            Your contribution and service help us make this event a success. 
            Join us in serving the community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="secondary" size="lg" className="rounded-full px-8">
              <Link href="/donations">Make a Donation</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-white text-white hover:bg-white/10">
              <Link href="/volunteer">Register as Volunteer</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}