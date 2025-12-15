# Kaffa - Smart Coffee Tracker & Review App

#### Video Demo: <https://youtu.be/YOUR_VIDEO_ID_HERE>

#### Description:

Kaffa is a comprehensive React Native mobile application designed for coffee enthusiasts who want to optimize their caffeine intake and track their coffee experiences. The app combines science-based caffeine tracking with a beautiful coffee review system, helping users make informed decisions about when to drink coffee for maximum effectiveness while minimizing sleep disruption.

## Why I Built This

As a coffee lover and computer science student, I wanted to create something that combined my passion for coffee with meaningful technology. I noticed that most coffee apps focus solely on reviews or simple logging, but none addressed the science behind caffeine consumption—like how milk affects absorption rates, or why drinking coffee immediately after waking isn't optimal due to cortisol peaks. Kaffa bridges this gap by providing both practical caffeine tracking and an enjoyable review experience.

## Core Features

### 1. Smart Caffeine Tracking (HomeScreen.tsx)

The centerpiece of the app is an interactive clock face that visualizes your caffeine levels throughout the day:

- **Real-time Caffeine Display**: Shows current active caffeine in milligrams at the center of the clock
- **Half-life Arcs**: Visual arcs on the clock show how each coffee's caffeine decays over time (caffeine has a ~5.5 hour half-life)
- **Science Zones**: 
  - **Cortisol Peak Zone (Teal)**: Highlights the 90-minute window after waking when natural cortisol is high—coffee is less effective during this period
  - **Sleep Impact Zone (Purple)**: Shows the 6-hour window before bedtime when caffeine may disrupt sleep
- **12hr/24hr Toggle**: Switch between clock formats based on preference
- **Timeline View**: Alternative horizontal timeline showing caffeine predictions throughout the day

### 2. Coffee Entry System

Users can log various coffee types with detailed tracking:

- **16+ Coffee Types**: From Espresso (75mg) to Cold Brew (200mg), including teas and energy drinks
- **Milk Type Selection**: 8 milk options (No Milk, Skimmed, Semi-Skimmed, Whole, Oat, Almond, Coconut, Soy) that affect caffeine absorption:
  - Whole milk delays absorption by 12 minutes and reduces effective caffeine by 12%
  - Almond milk has minimal impact (3 minute delay, 1% reduction)
- **Effective Caffeine Calculation**: The app calculates actual caffeine absorbed based on milk choice

### 3. Coffee Review System (AddReviewScreen.tsx)

A comprehensive review form for rating coffee experiences:

- **Flexible Entry**: Users only need to fill in one of Coffee Name, Roaster, or Origin (recognizing that users may not always know all details)
- **Detailed Rating Metrics**: 5-star ratings for Flavour, Aroma, Body, Acidity, Strength, and Overall
- **Radar Chart Visualization**: A live-updating radial chart (RadarChart.tsx) displays the flavor profile as users rate—creating a visual "fingerprint" of each coffee
- **Milk Type Tracking**: Records what milk was used
- **Tasting Notes**: Free-text field for detailed descriptions
- **Auto-complete Suggestions**: Popular roasters and origins for faster entry

### 4. Review Browsing (ReviewsScreen.tsx)

Browse and search your coffee collection:

- **Search & Filter**: Find reviews by coffee name, roaster, origin, or notes
- **Statistics Dashboard**: View total reviews, average ratings, and number of roasters tried
- **Pull-to-Refresh**: Standard mobile pattern for updating the list

## File Structure

```
Espressoo/
├── App.tsx                          # Main app entry, navigation setup, tab bar configuration
├── src/
│   ├── components/
│   │   ├── RadarChart.tsx           # SVG-based radar/spider chart for flavor profiles
│   │   ├── ReviewCard.tsx           # Individual review display with ratings and chart
│   │   ├── ReviewsList.tsx          # FlatList wrapper for reviews with empty state
│   │   └── CoffeeShopCard.tsx       # Coffee shop display component
│   ├── data/
│   │   ├── reviews.ts               # Sample review data and CRUD operations
│   │   ├── coffeeShops.ts           # Coffee shop mock data
│   │   └── coffeeEntries.ts         # Persistent storage for coffee log entries
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Main caffeine tracking clock (3700+ lines)
│   │   ├── AddReviewScreen.tsx      # Coffee review form with radar chart
│   │   ├── ReviewsScreen.tsx        # Review browsing and search
│   │   ├── ProfileScreen.tsx        # User profile with tabs
│   │   ├── SearchScreen.tsx         # Coffee shop discovery
│   │   ├── ActivityScreen.tsx       # Activity feed/favorites
│   │   └── CameraScreen.tsx         # Placeholder for future camera feature
│   ├── types/
│   │   └── review.ts                # TypeScript interfaces for Review, ReviewFormData
│   └── utils/
│       └── WidgetDataManager.ts     # Widget data synchronization utility
├── assets/
│   └── bean-heart-logo.png          # App logo (heart-shaped coffee bean)
├── package.json                     # Dependencies and scripts
└── app.json                         # Expo configuration
```

## Design Decisions

### Why React Native with Expo?

I chose React Native with Expo for several reasons:
1. **Cross-platform**: Write once, deploy to iOS and Android
2. **Rapid Development**: Hot reloading and Expo's managed workflow accelerated development
3. **Rich Ecosystem**: Access to native features through Expo modules
4. **TypeScript Support**: Strong typing for better code quality and IDE support

### Why a Clock Visualization?

The clock metaphor was intentional:
- **Intuitive Time Mapping**: Users naturally understand clock positions as times of day
- **Caffeine Decay Visualization**: Arcs showing caffeine half-life are more intuitive than numbers
- **At-a-Glance Information**: Quick understanding of current caffeine status vs. looking at tables

### Why Radar Charts for Reviews?

I implemented custom SVG radar charts rather than using a library because:
- **Unique Visualization**: Creates a "flavor fingerprint" that's immediately recognizable
- **Live Updates**: The chart animates as users adjust ratings, providing instant feedback
- **Educational**: Helps users understand how different coffees compare across dimensions
- **Custom Styling**: Coffee-themed colors (#6F4E37 brown, #D4AF37 gold) match the app aesthetic

### Caffeine Science Implementation

The app uses real caffeine science:
- **5.5-hour half-life**: Standard caffeine metabolism rate
- **45-minute absorption**: Base time for caffeine to reach peak levels
- **Milk absorption delays**: Based on research showing fats/proteins slow absorption
- **Cortisol timing**: First 90 minutes after waking have naturally high cortisol, reducing caffeine's stimulant effect

### Form Validation Philosophy

For the review form, I made a deliberate UX decision:
- **Flexible Requirements**: Only one of Name/Roaster/Origin is required
- **Rationale**: Users at a café might know the roaster but not the specific bean; someone gifted coffee might only know the origin
- **User-Friendly**: Reduces friction while still ensuring meaningful data

## Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation v7** - Tab and stack navigation
- **React Native Elements** - UI component library (AirbnbRating, Icon, Button, etc.)
- **React Native SVG** - Custom SVG graphics for clock and radar chart
- **AsyncStorage** - Local data persistence

## Installation & Running

### Prerequisites
- Node.js v16 or higher
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator, or Expo Go app on physical device

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd Espressoo

# Install dependencies
npm install

# Start the development server
npx expo start

# Run on specific platform
npm run ios      # iOS Simulator
npm run android  # Android Emulator
```

## Usage

### Tracking Coffee

1. Tap the heart-bean icon in the center of the tab bar
2. Select your coffee type (Black or Milk-based)
3. For milk-based drinks, choose your milk type
4. The app logs the coffee and updates the clock visualization

### Adding a Review

1. Navigate to the "New Coffee" screen
2. Fill in at least one of: Coffee Name, Roaster, or Origin
3. Select your milk type
4. Rate the coffee using the 5-star systems for each metric
5. Watch the radar chart update in real-time
6. Add optional tasting notes
7. Tap "Save Review"

### Viewing the Clock

- **Center Number**: Your current active caffeine in mg
- **Orange Arcs**: Each coffee's remaining caffeine over time
- **Teal Arc**: Cortisol peak zone (avoid coffee here for best effect)
- **Purple Arc**: Sleep impact zone (coffee here may affect sleep)

## Future Improvements

If I had more time, I would add:
- User authentication and cloud sync
- Photo capture for coffee/latte art
- Social features (sharing reviews, following friends)
- Machine learning for personalized caffeine sensitivity
- Apple Watch widget for quick logging
- Integration with coffee shop APIs for location-based features

## Acknowledgments

- CS50 staff for an incredible course
- The React Native and Expo communities
- Coffee science research from various academic sources
- My local coffee shops for "research" purposes ☕

---

This project was created as the final project for Harvard's CS50 course.

