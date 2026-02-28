
"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where } from "firebase/firestore";
import { Loader2, Sparkles } from "lucide-react";

export default function GalleryPage() {
  const db = useFirestore();

  const galleryQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "gallery_images"),
      where("isVisible", "==", true),
      orderBy("createdAt", "desc")
    );
  }, [db]);

  const { data: galleryImages, isLoading } = useCollection(galleryQuery);

  return (
    <div className="py-12 md:py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Photo Gallery</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Glimpses of past events and divine moments. Experience the spiritual energy captured through our lens.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-medium">Loading sacred glimpses...</p>
          </div>
        ) : galleryImages && galleryImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryImages.map((image) => (
              <Card key={image.id} className="group relative overflow-hidden rounded-2xl border-none shadow-xl aspect-square cursor-pointer bg-muted">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <p className="text-white font-bold text-lg">{image.description}</p>
                  <p className="text-white/70 text-sm">Sai Parivar Ambala</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-24 space-y-6">
            <div className="bg-primary/5 p-8 rounded-full w-fit mx-auto">
              <Sparkles className="h-16 w-16 text-primary/20" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">Gallery is empty</h3>
              <p className="text-muted-foreground leading-relaxed">
                Check back soon for divine glimpses of the Mahotsav. Om Sai Ram.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
