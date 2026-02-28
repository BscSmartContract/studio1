import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card } from "@/components/ui/card";

export default function GalleryPage() {
  const galleryImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-') || img.id === 'sai-baba');

  return (
    <div className="py-12 md:py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Photo Gallery</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Glimpses of past events and divine moments. Experience the spiritual energy captured through our lens.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {galleryImages.map((image) => (
            <Card key={image.id} className="group relative overflow-hidden rounded-2xl border-none shadow-xl aspect-square cursor-pointer">
              <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                data-ai-hint={image.imageHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <p className="text-white font-bold text-lg">{image.description}</p>
                <p className="text-white/70 text-sm">Sai Parivar Ambala</p>
              </div>
            </Card>
          ))}
          
          {/* Adding extra mock images for a full grid */}
          {[1, 2, 3].map((i) => (
            <Card key={`mock-${i}`} className="group relative overflow-hidden rounded-2xl border-none shadow-xl aspect-square cursor-pointer">
              <Image
                src={`https://picsum.photos/seed/extra-${i}/800/800`}
                alt="Divine Event Image"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                data-ai-hint="spiritual event"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <p className="text-white font-bold text-lg">Event Glimpse {i}</p>
                <p className="text-white/70 text-sm">Sacred Moments</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}