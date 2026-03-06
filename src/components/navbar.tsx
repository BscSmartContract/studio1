
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, Calendar, LogIn, LogOut, Youtube } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const auth = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Live Darshan", href: "/live", icon: <Youtube className="w-4 h-4 mr-1 text-red-600" /> },
    { name: "Volunteer", href: "/volunteer" },
    { name: "Stay Tuned", href: "/stay-tuned" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg pb-0.5">
              ॐ
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-lg leading-none text-primary uppercase tracking-tight">Sai Paduka</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Sai Parivar Ambala</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium hover:text-primary transition-colors duration-200 flex items-center"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger className="text-sm font-medium hover:text-primary transition-colors duration-200 flex items-center outline-none">
                More <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href="/events" className="flex items-center py-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule
                  </Link>
                </DropdownMenuItem>
                
                <div className="h-px bg-muted my-1" />

                {user && (
                  <DropdownMenuItem onClick={handleSignOut} className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-primary"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border animate-in slide-in-from-top duration-300">
          <div className="flex flex-col space-y-4 px-4 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-lg font-medium hover:text-primary py-2 border-b border-border/50 flex items-center"
                onClick={() => setIsOpen(false)}
              >
                {link.icon && <span className="mr-2">{link.icon}</span>}
                {link.name}
              </Link>
            ))}
            <Link
              href="/events"
              className="text-lg font-medium hover:text-primary py-2 border-b border-border/50 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Link>
            
            {user && (
              <button
                className="text-lg font-medium text-destructive text-left py-2 flex items-center"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
