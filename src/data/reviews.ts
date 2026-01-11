import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";
import { Review, ReviewFormData } from "../types/review";

const REVIEWS_STORAGE_KEY = "@espressoo:reviews";

// In-memory cache
let reviews: Review[] = [];

// Load reviews from storage
export const loadReviews = async (): Promise<Review[]> => {
  try {
    const stored = await AsyncStorage.getItem(REVIEWS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      reviews = parsed.map((review: any) => ({
        ...review,
        date: new Date(review.date),
      }));
    } else {
      reviews = [];
    }
    return reviews;
  } catch (error) {
    console.error("Error loading reviews:", error);
    return [];
  }
};

// Save reviews to storage
const saveReviews = async (reviewsToSave: Review[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      REVIEWS_STORAGE_KEY,
      JSON.stringify(reviewsToSave)
    );
  } catch (error) {
    console.error("Error saving reviews:", error);
  }
};

// Initialize reviews on module load
loadReviews().catch(console.error);

// Function to add a new review
export const addReview = async (
  reviewData: ReviewFormData
): Promise<Review> => {
  const newReview: Review = {
    id: Date.now().toString(),
    ...reviewData,
    date: new Date(),
    userId: "user1", // In a real app, this would come from authentication
    tags: [],
  };

  reviews.unshift(newReview); // Add to beginning of array
  await saveReviews(reviews); // Persist to storage

  // Emit event to notify other screens
  DeviceEventEmitter.emit("reviewAdded", newReview);

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
