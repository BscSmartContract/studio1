
"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, PlayCircle, ChevronDown, Calendar, HandHeart, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Live Darshan", href: "/live", icon: <PlayCircle className="w-4 h-4 mr-1 text-accent animate-pulse" /> },
    { name: "Darshan", href: "/darshan" },
  ];

  const moreLinks = [
    { name: "Event Schedule", href: "/events", icon: <Calendar className="w-4 h-4 mr-2" /> },
    { name: "Volunteer", href: "/volunteer", icon: <HandHeart className="w-4 h-4 mr-2" /> },
    { name: "Donations", href: "/donations", icon: <Heart className="w-4 h-4 mr-2" /> },
    { name: "Contact", href: "/contact", icon: <Menu className="w-4 h-4 mr-2" /> },
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
          <div className="hidden md:flex items-center space-x-6">
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
                {moreLinks.map((link) => (
                  <DropdownMenuItem key={link.name} asChild className="rounded-lg cursor-pointer">
                    <Link href={link.href} className="flex items-center py-2">
                      {link.icon}
                      {link.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-md font-bold px-6 rounded-full transition-all hover:scale-105 active:scale-95">
              <Link href="/darshan">Register</Link>
            </Button>
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
                {link.icon}
                {link.name}
              </Link>
            ))}
            {moreLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-lg font-medium hover:text-primary py-2 border-b border-border/50 flex items-center"
                onClick={() => setIsOpen(false)}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col space-y-3 pt-4">
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-full shadow-lg shadow-primary/20">
                <Link href="/darshan" onClick={() => setIsOpen(false)}>Register for Darshan</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
