export type CoffeeShop = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  description: string;
  image: any;
};

export const coffeeShops: CoffeeShop[] = [
  {
    id: "1",
    name: "Blue Bottle Coffee",
    address: "66 Mint St, San Francisco, CA",
    latitude: 37.7825,
    longitude: -122.4081,
    rating: 4.7,
    reviewCount: 120,
    description:
      "Bright, modern spot for single-origin espresso & pour-over coffee.",
    image: require("../../assets/bluebottle.jpg"),
  },
  // Add more shops...
];
