
import { redirect } from 'next/navigation';

export default function GalleryPage() {
  // Gallery has been removed from the site.
  // Redirecting visitors back to the home page.
  redirect('/');
  return null;
}
