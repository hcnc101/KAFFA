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
  // Everyday rating metrics (0-10 scale)
  taste: number; // 0-10: Did it taste good?
  strength: number; // 0-10: Was it the right strength? (5 = just right)
  smoothness: number; // 0-10: Smooth vs bitter/harsh
  value: number; // 0-10: Worth what you paid?
  orderAgain: number; // 0-10: Would you order it again?
  milkType: string;
  keywords?: string[];
}

export interface ReviewFormData {
  coffeeName: string;
  roaster: string;
  origin: string;
  rating: number; // 0-100
  notes: string;
  // Everyday rating metrics (0-10 scale)
  taste: number; // 0-10: Did it taste good?
  strength: number; // 0-10: Was it the right strength? (5 = just right)
  smoothness: number; // 0-10: Smooth vs bitter/harsh
  value: number; // 0-10: Worth what you paid?
  orderAgain: number; // 0-10: Would you order it again?
  milkType: string;
  keywords?: string[];
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  topRoasters: string[];
  topOrigins: string[];
}
