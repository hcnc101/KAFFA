export interface Review {
  id: string;
  coffeeName: string;
  roaster: string;
  origin: string;
  rating: number;
  notes: string;
  date: Date;
  userId: string;
  imageUrl?: string;
  tags?: string[];
}

export interface ReviewFormData {
  coffeeName: string;
  roaster: string;
  origin: string;
  rating: number;
  notes: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  topRoasters: string[];
  topOrigins: string[];
}
