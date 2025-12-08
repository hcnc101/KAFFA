import { Review, ReviewFormData } from "../types/review";

// Sample reviews data
export const reviews: Review[] = [
  {
    id: "1",
    coffeeName: "Ethiopian Yirgacheffe",
    roaster: "Stumptown Coffee",
    origin: "Ethiopia",
    rating: 85, // 0-100 scale
    notes:
      "Bright and floral with notes of jasmine and citrus. Light body with a clean finish.",
    date: new Date("2024-01-15"),
    userId: "user1",
    tags: ["floral", "citrus", "light-roast"],
    flavour: 9,
    aroma: 8,
    aftertaste: 8,
    body: 6,
    acidity: 8,
    balance: 7,
    overall: 9,
    milkType: "None",
    keywords: ["floral", "citrus", "light"],
  },
  {
    id: "2",
    coffeeName: "Colombian Supremo",
    roaster: "Blue Bottle Coffee",
    origin: "Colombia",
    rating: 75, // 0-100 scale
    notes:
      "Medium body with chocolate notes and a hint of nuttiness. Smooth and balanced.",
    date: new Date("2024-01-10"),
    userId: "user1",
    tags: ["chocolate", "nuts", "medium-roast"],
    flavour: 7,
    aroma: 7,
    aftertaste: 7,
    body: 8,
    acidity: 5,
    balance: 7,
    overall: 8,
    milkType: "Oat",
    keywords: ["chocolate", "nutty", "smooth"],
  },
  {
    id: "3",
    coffeeName: "Guatemala Antigua",
    roaster: "Intelligentsia Coffee",
    origin: "Guatemala",
    rating: 88, // 0-100 scale
    notes:
      "Rich and complex with notes of dark chocolate, caramel, and a subtle smokiness.",
    date: new Date("2024-01-05"),
    userId: "user1",
    tags: ["chocolate", "caramel", "dark-roast"],
    flavour: 8,
    aroma: 8,
    aftertaste: 8,
    body: 9,
    acidity: 6,
    balance: 8,
    overall: 9,
    milkType: "Almond",
    keywords: ["chocolate", "caramel", "smoky"],
  },
];

// Function to add a new review
export const addReview = (reviewData: ReviewFormData): Review => {
  const newReview: Review = {
    id: Date.now().toString(),
    ...reviewData,
    date: new Date(),
    userId: "user1", // In a real app, this would come from authentication
    tags: [],
  };

  reviews.unshift(newReview); // Add to beginning of array
  return newReview;
};

// Function to get all reviews
export const getAllReviews = (): Review[] => {
  return [...reviews];
};

// Function to get reviews by user
export const getReviewsByUser = (userId: string): Review[] => {
  return reviews.filter((review) => review.userId === userId);
};

// Function to get reviews by roaster
export const getReviewsByRoaster = (roaster: string): Review[] => {
  return reviews.filter((review) =>
    review.roaster.toLowerCase().includes(roaster.toLowerCase())
  );
};

// Function to get reviews by origin
export const getReviewsByOrigin = (origin: string): Review[] => {
  return reviews.filter((review) =>
    review.origin.toLowerCase().includes(origin.toLowerCase())
  );
};
