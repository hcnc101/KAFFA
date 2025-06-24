# Kaffa - Coffee Review App

A beautiful React Native app for coffee enthusiasts to discover, review, and share their coffee experiences.

## Features

### 🎯 Core Features

- **Add Coffee Reviews**: Create detailed reviews with coffee name, roaster, origin, rating, and tasting notes
- **Review Management**: View all reviews with search and filtering capabilities
- **Beautiful UI**: Modern, coffee-themed design with intuitive navigation
- **Form Validation**: Comprehensive validation for all required fields
- **Success Feedback**: User-friendly success messages and form reset

### 📱 Screens

1. **Home Screen**: Instagram-style feed with coffee posts and stories
2. **Add Review Screen**: Form to add new coffee reviews with:
   - Coffee name, roaster, and origin
   - 5-star rating system
   - Tasting notes (optional)
   - Form validation and success feedback
3. **Reviews Screen**: Browse all reviews with:
   - Search functionality
   - Filtering options
   - Statistics display
   - Pull-to-refresh
4. **Discover Screen**: Search for coffee shops and locations
5. **Activity Screen**: Social interactions and notifications
6. **Profile Screen**: User profile and settings

### 🏗️ Architecture

#### Components

- `ReviewCard`: Displays individual coffee reviews with ratings, details, and tags
- `ReviewsList`: Manages the list of reviews with empty state handling
- `AddReviewScreen`: Complete review form with validation

#### Data Management

- `src/types/review.ts`: TypeScript interfaces for reviews
- `src/data/reviews.ts`: Sample data and CRUD operations
- Form validation and error handling

#### Navigation

- Bottom tab navigation with coffee-themed icons
- Stack navigation for detailed views
- Proper TypeScript typing for navigation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Espressoo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on your preferred platform**

   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web
   npm run web
   ```

## Usage

### Adding a Review

1. Navigate to the "New Coffee" tab (camera icon)
2. Fill in the required fields:
   - Coffee Name (e.g., "Ethiopian Yirgacheffe")
   - Roaster (e.g., "Stumptown Coffee")
   - Origin (e.g., "Ethiopia")
   - Rating (1-5 stars)
   - Tasting Notes (optional)
3. Tap "Submit Review"
4. Review will be added to your collection

### Viewing Reviews

1. Navigate to the "Reviews" tab
2. Browse all your coffee reviews
3. Use the search bar to find specific reviews
4. Pull down to refresh the list

### Features in Action

- **Form Validation**: Try submitting without required fields
- **Success Feedback**: See confirmation messages after adding reviews
- **Search**: Search by coffee name, roaster, origin, or notes
- **Statistics**: View review count, average rating, and roaster count

## Technical Details

### Dependencies

- React Native with Expo
- React Navigation v7
- React Native Elements UI library
- TypeScript for type safety

### File Structure

```
src/
├── components/
│   ├── ReviewCard.tsx      # Individual review display
│   └── ReviewsList.tsx     # List management
├── data/
│   ├── coffeeShops.ts      # Coffee shop data
│   └── reviews.ts          # Review data and operations
├── screens/
│   ├── AddReviewScreen.tsx # Review form
│   ├── ReviewsScreen.tsx   # Reviews browser
│   └── ...                 # Other screens
└── types/
    └── review.ts           # TypeScript interfaces
```

### Key Features Implemented

- ✅ Complete review form with validation
- ✅ Beautiful UI with coffee theme
- ✅ Search and filtering capabilities
- ✅ Statistics display
- ✅ Pull-to-refresh functionality
- ✅ TypeScript type safety
- ✅ Responsive design
- ✅ Error handling and user feedback

## Future Enhancements

### Planned Features

- [ ] User authentication
- [ ] Photo uploads for reviews
- [ ] Social features (likes, comments)
- [ ] Coffee shop integration
- [ ] Offline support
- [ ] Push notifications
- [ ] Advanced filtering (by roast level, price, etc.)
- [ ] Review analytics and insights

### Technical Improvements

- [ ] Database integration (Firebase/Supabase)
- [ ] Image storage and optimization
- [ ] Performance optimizations
- [ ] Unit and integration tests
- [ ] CI/CD pipeline

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

**Note**: This is a demo application. For production use, consider adding proper authentication, database integration, and security measures.
