export interface Review {
  id: string;
  coffeeName: string;
  roaster: string;
  origin: string;
  rating: number; // legacy overall rating
  notes: string;
  date: Date;
  userId: string;
  imageUrl?: string;
  tags?: string[];
  // New metrics
  flavour: number;
  aroma: number;
  body: number;
  acidity: number;
  strength: number;
  overall: number;
  milkType: string;
  keywords?: string[];
}

export interface ReviewFormData {
  coffeeName: string;
  roaster: string;
  origin: string;
  rating: number;
  notes: string;
  // New metrics
  flavour: number;
  aroma: number;
  body: number;
  acidity: number;
  strength: number;
  overall: number;
  milkType: string;
  keywords?: string[];
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  topRoasters: string[];
  topOrigins: string[];
}
