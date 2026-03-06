
import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Facebook, Sparkles, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted py-16 border-t border-border mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* Brand and About */}
          <div className="space-y-6 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl shadow-md pb-0.5">
                ॐ
              </div>
              <h3 className="font-headline font-bold text-xl text-primary leading-none uppercase tracking-tight">Sai Parivar<br /><span className="text-[10px] text-muted-foreground tracking-widest">Ambala</span></h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Dedicated to serving humanity through the teachings of Shri Sai Baba. 
              Join us for the divine Sai Paduka event and experience spiritual bliss.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-background rounded-full text-primary hover:text-accent transition-colors shadow-sm border border-border"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-background rounded-full text-primary hover:text-accent transition-colors shadow-sm border border-border"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Spiritual Message */}
          <div className="space-y-4 md:col-span-1">
            <h4 className="font-headline font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Divine Message
            </h4>
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 italic text-sm text-muted-foreground leading-relaxed relative">
              <span className="absolute -top-2 -left-1 text-4xl text-primary/20 font-serif">"</span>
              क्यों डरते हो जब मैं हूँ? अपने सभी बोझ मुझ पर डाल दो और मैं उन्हें उठा लूँगा। श्रद्धा और सबुरी विश्वास के दो स्तंभ हैं।
              <p className="mt-2 font-bold text-primary not-italic">— Shirdi Sai Baba</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 md:col-span-1">
            <h4 className="font-headline font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/live" className="hover:text-primary transition-colors flex items-center gap-1"><Youtube className="h-3 w-3 text-red-600" /> Live Darshan</Link></li>
              <li><Link href="/volunteer" className="hover:text-primary transition-colors">Volunteer Signup</Link></li>
              <li><Link href="/stay-tuned" className="hover:text-primary transition-colors">Stay Tuned</Link></li>
              <li><Link href="/events" className="hover:text-primary transition-colors">Event Schedule</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4 md:col-span-1">
            <h4 className="font-headline font-semibold text-lg">Event Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>Aggarwal Bhavan, Ambala<br />Event Date: 9th March</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a href="tel:9812389831" className="hover:text-primary transition-colors">98123 89831</a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a href="mailto:saibabatrustambala@gmail.com" className="hover:text-primary transition-colors">saibabatrustambala@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary font-bold text-lg tracking-[0.2em] uppercase">
            <div className="h-[1px] w-8 bg-primary/30" />
            <span>Om Sai Ram</span>
            <div className="h-[1px] w-8 bg-primary/30" />
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              © {new Date().getFullYear()} Sai Parivar Ambala. All rights reserved. 
            </p>
            <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">
              Shraddha • Saburi
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
