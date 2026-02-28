import Link from "next/link";
import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted py-12 border-t border-border mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand and About */}
          <div className="space-y-4">
            <h3 className="font-headline font-bold text-xl text-primary">Sai Parivar Ambala</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Dedicated to serving humanity through the teachings of Shri Sai Baba. 
              Join us for the divine Sai Paduka event and experience spiritual bliss.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-background rounded-full text-primary hover:text-accent transition-colors shadow-sm"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-background rounded-full text-primary hover:text-accent transition-colors shadow-sm"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-headline font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/darshan" className="hover:text-primary transition-colors">Darshan Registration</Link></li>
              <li><Link href="/volunteer" className="hover:text-primary transition-colors">Volunteer Signup</Link></li>
              <li><Link href="/donations" className="hover:text-primary transition-colors">Donation Page</Link></li>
              <li><Link href="/gallery" className="hover:text-primary transition-colors">Photo Gallery</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
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

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Sai Parivar Ambala. All rights reserved. OM SAI RAM.</p>
        </div>
      </div>
    </footer>
  );
}