export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  images: string[];
  description: string; // Basic short description
  persuasiveDescription?: string; // AI generated long narrative
  headline?: string;
  subHeadline?: string;
  benefits?: string[];
  features?: { title: string; description: string; icon: string }[];
  reviews?: { author: string; rating: number; comment: string; date: string }[];
  faqs?: { question: string; answer: string }[];
  videoUrl?: string;
  buyNowUrl: string; // External link
  createdAt: number;
}

export interface Ad {
  id: string;
  placement: string;
  content: string;
  active: number;
}
