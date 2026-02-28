"use client";

import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlayCircle, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LiveDarshanPage() {
  const db = useFirestore();

  const configRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "app_configuration", "main");
  }, [db]);

  const { data: config, isLoading } = useDoc(configRef);

  // Function to convert regular youtube link to embed link
  const getEmbedUrl = (url?: string) => {
    if (!url) return "";
    if (url.includes("embed")) return url;
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  return (
    <div className="py-12 md:py-24 bg-background min-h-screen">
      <div className="container px-4 mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4 flex items-center justify-center gap-3">
            <PlayCircle className="h-10 w-10 text-accent animate-pulse" />
            Live Darshan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the divine grace of Shirdi Sai Baba from the comfort of your home. 
            Join our live stream for prayers and rituals.
          </p>
        </div>

        <div className="space-y-8">
          {isLoading ? (
            <Skeleton className="w-full aspect-video rounded-3xl shadow-2xl" />
          ) : config?.liveDarshanYoutubeLink ? (
            <Card className="overflow-hidden border-none shadow-2xl rounded-3xl bg-black">
              <CardContent className="p-0">
                <div className="relative w-full aspect-video">
                  <iframe
                    src={getEmbedUrl(config.liveDarshanYoutubeLink)}
                    title="Live Darshan Stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-12 text-center border-dashed border-2 border-muted flex flex-col items-center">
              <PlayCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-muted-foreground">Stream Offline</h3>
              <p className="text-muted-foreground">The live Darshan stream is currently not available. Please check back later.</p>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-muted/30 border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Stream Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Daily Morning Aarti: 9:00 AM</p>
                <p>• Special Bhajan Sandhya: Sunday 5:00 PM</p>
                <p>• Night Shej Aarti: 8:30 PM</p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border border-primary/10">
              <CardHeader>
                <CardTitle>Spiritual Significance</CardTitle>
                <CardDescription>Why we offer Live Darshan</CardDescription>
              </CardHeader>
              <CardContent className="text-sm italic text-muted-foreground leading-relaxed">
                "Whoever puts his feet on Shirdi soil, his sufferings would come to an end. Even if I am not in my physical body, my words will be true. My bones will speak from my tomb." - Shri Sai Baba
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
