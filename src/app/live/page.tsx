
"use client";

import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LiveDarshanPage() {
  const db = useFirestore();
  const configRef = useMemoFirebase(() => db ? doc(db, "app_configuration", "main") : null, [db]);
  const { data: config, isLoading } = useDoc(configRef);

  const liveUrl = config?.liveStreamUrl;

  // Helper to extract YouTube video ID
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
  };

  const embedUrl = getEmbedUrl(liveUrl);

  return (
    <div className="py-12 md:py-24 bg-background">
      <div className="container px-4 mx-auto max-w-5xl">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-600 text-xs font-bold uppercase tracking-widest animate-pulse">
            Live Stream
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">Live Sacred Darshan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto italic">
            "I am in every heart, every soul. Experience my presence wherever you are."
          </p>
        </div>

        <Card className="border-primary/20 shadow-2xl overflow-hidden rounded-[2.5rem] bg-black">
          <CardHeader className="bg-primary/5 border-b border-primary/10 py-4 px-8 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
              <Youtube className="h-5 w-5 text-red-600" /> Shirdi Sai Baba Event
            </CardTitle>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary" /> Shraddha • Saburi
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="aspect-video w-full flex items-center justify-center bg-muted">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : embedUrl ? (
              <div className="relative aspect-video w-full">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={embedUrl}
                  title="Sai Baba Live Darshan"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video w-full flex flex-col items-center justify-center space-y-6 text-center px-6">
                <div className="bg-muted/20 p-8 rounded-full">
                  <Youtube className="h-20 w-20 text-muted-foreground opacity-20" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Darshan Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Om Sai Ram. The live stream has not started yet. Please check back during the Aarti and Palki Yatra timings.
                  </p>
                </div>
                <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-2xl border border-primary/20 text-primary text-sm font-bold">
                  <AlertCircle className="h-4 w-4" /> Check Event Schedule for Timings
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="p-8 bg-muted/30 rounded-[2rem] border border-primary/10 space-y-4">
              <h3 className="text-xl font-bold text-primary">Spiritual Participation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Even through the screen, your devotion reaches Shirdi. Light a lamp in your home, sit in a quiet place, and join us in chanting the sacred names of Shri Sai Baba.
              </p>
           </div>
           <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/20 space-y-4">
              <h3 className="text-xl font-bold text-foreground">Technical Support</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If the stream is buffering, try refreshing the page or ensuring you have a stable internet connection. The divine connection requires patience (Saburi).
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
