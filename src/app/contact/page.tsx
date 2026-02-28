import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Instagram, Facebook, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="py-12 md:py-24 bg-background">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions or need assistance? Reach out to the Sai Parivar Ambala team. 
            We are here to help you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="border-primary/10 shadow-md">
                <CardContent className="pt-6">
                  <Phone className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-bold text-lg mb-1">Call Us</h3>
                  <p className="text-sm text-muted-foreground mb-4">For immediate inquiries</p>
                  <a href="tel:9812389831" className="text-primary font-bold hover:underline">98123 89831</a>
                </CardContent>
              </Card>

              <Card className="border-primary/10 shadow-md">
                <CardContent className="pt-6">
                  <Mail className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-bold text-lg mb-1">Email Us</h3>
                  <p className="text-sm text-muted-foreground mb-4">For registration issues</p>
                  <a href="mailto:saibabatrustambala@gmail.com" className="text-primary font-bold hover:underline break-all">saibabatrustambala@gmail.com</a>
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/10 shadow-md">
              <CardContent className="pt-6">
                <MapPin className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">Venue Address</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Aggarwal Bhavan, Near Railway Station Area,<br />
                  Ambala City, Haryana - 134003
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/10 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="p-4 bg-muted rounded-full group-hover:bg-primary/20 transition-colors">
                      <Instagram className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium">Instagram</span>
                  </a>
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="p-4 bg-muted rounded-full group-hover:bg-primary/20 transition-colors">
                      <Facebook className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs font-medium">Facebook</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map and Venue Info */}
          <div className="space-y-6">
            <Card className="h-full border-primary/20 shadow-xl overflow-hidden min-h-[400px]">
              <div className="w-full h-full bg-muted">
                {/* Embedded Google Maps Placeholder */}
                <iframe
                  title="Venue Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13775.36214064516!2d76.7681!3d30.3752!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390fb63013b91a7b%3A0xc47b8508f7d9761e!2sAmbala%20City%2C%20Haryana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "400px" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}