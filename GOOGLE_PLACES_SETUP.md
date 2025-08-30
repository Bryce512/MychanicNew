# Google Places API Setup Instructions

To get real mechanic shop data from Google Places API, you need to:

## 1. Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:

   - Places API
   - Maps JavaScript API
   - Geocoding API

4. Create credentials (API Key)
5. Restrict the API key to your app's bundle ID for security

## 2. Configure API Key

Open `app/services/placesService.ts` and replace:

```typescript
const GOOGLE_PLACES_API_KEY = "YOUR_GOOGLE_PLACES_API_KEY";
```

With your actual API key:

```typescript
const GOOGLE_PLACES_API_KEY = "AIzaSyC4YoP_Actually_Your_Real_API_Key_Here";
```

## 3. Toggle Real vs Mock Data

In `app/screens/FindMechanics.tsx`, change this line to use real data:

```typescript
const [useMockData, setUseMockData] = useState(false); // Set to false for real data
```

## 4. Test the Integration

1. Run your app with location permissions enabled
2. Grant location access when prompted
3. Switch to Map View to see real nearby mechanic shops
4. Use the search functionality to find specific services

## Current Status

- ✅ Mock data is working (set as default for development)
- ✅ Google Places API service is implemented
- ✅ Real mechanic cards show actual Google data
- ✅ Map markers display real shop locations
- ⏳ Waiting for API key configuration

## API Features Implemented

- **Nearby Search**: Finds auto repair shops within radius
- **Text Search**: Search for specific services or shop names
- **Place Details**: Get additional info like photos, phone, website
- **Distance Calculation**: Shows distance from user location
- **Photo Integration**: Displays shop photos when available
- **Opening Hours**: Shows if shop is currently open/closed
- **Ratings & Reviews**: Displays Google ratings and review counts

## Cost Considerations

Google Places API has usage-based pricing. For development:

- First $200/month is free
- Places Nearby Search: $32 per 1000 requests
- Places Text Search: $32 per 1000 requests
- Place Details: $17 per 1000 requests
- Place Photos: $7 per 1000 requests

Consider implementing request caching for production use.
