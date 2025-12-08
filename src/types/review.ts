export interface Review {
  id: string;
  coffeeName: string;
  roaster: string;
  origin: string;
  rating: number; // legacy overall rating (0-100)
  notes: string;
  date: Date;
  userId: string;
  imageUrl?: string;
  tags?: string[];
  // SCA/Hoffmann-style metrics (0-10 scale, displayed as 0-100)
  flavour: number; // 0-10
  aroma: number; // 0-10
  aftertaste: number; // 0-10
  acidity: number; // 0-10
  body: number; // 0-10
  balance: number; // 0-10 (replaces strength)
  overall: number; // 0-10
  milkType: string;
  keywords?: string[];
}

export interface ReviewFormData {
  coffeeName: string;
  roaster: string;
  origin: string;
  rating: number; // 0-100
  notes: string;
  // SCA/Hoffmann-style metrics (0-10 scale, displayed as 0-100)
  flavour: number; // 0-10
  aroma: number; // 0-10
  aftertaste: number; // 0-10
  acidity: number; // 0-10
  body: number; // 0-10
  balance: number; // 0-10
  overall: number; // 0-10
  milkType: string;
  keywords?: string[];
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  topRoasters: string[];
  topOrigins: string[];
}
