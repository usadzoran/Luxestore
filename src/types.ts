export interface Product {
  id: string;
  slug?: string;
  name: string;
  headline?: string;
  subHeadline?: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  benefits?: string[];
  featuresList?: { title: string; description: string; icon: string }[];
  reviews?: { author: string; rating: number; comment: string; date: string }[];
  faqs?: { question: string; answer: string }[];
  videoUrl?: string;
  externalLink: string;
}
