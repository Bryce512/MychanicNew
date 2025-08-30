// Google Places API service for finding nearby mechanic shops
export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  reviewCount?: number;
  isOpen?: boolean;
  photoUrl?: string;
  phoneNumber?: string;
  website?: string;
  priceLevel?: number;
  distance?: number;
}

// Note: You'll need to add your Google Places API key here
const GOOGLE_PLACES_API_KEY = "AIzaSyDH_5rYB8ja6e6xtjZ5hmmN7NosXNEpeI8"; // Replace with your actual API key

// Enable this for development if you don't have API key working yet
const USE_MOCK_DATA_FALLBACK = false; // Set to false when API key is properly configured

const PLACES_API_BASE_URL = "https://maps.googleapis.com/maps/api/place";

export class PlacesService {
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3959; // Radius of the Earth in miles
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  static async searchNearbyMechanics(
    latitude: number,
    longitude: number,
    radius: number = 10000, // 10km radius in meters
    minResults: number = 5 // Minimum number of results to try to get
  ): Promise<PlaceResult[]> {
    // If API key is not working, return mock data
    if (
      USE_MOCK_DATA_FALLBACK ||
      !GOOGLE_PLACES_API_KEY ||
      GOOGLE_PLACES_API_KEY.includes("YOUR_")
    ) {
      console.log("Using mock data fallback");
      return getMockMechanicData(latitude, longitude);
    }

    let currentRadius = radius;
    let attempts = 0;
    const maxAttempts = 3;
    const maxRadius = 50000; // 50km max

    while (attempts < maxAttempts && currentRadius <= maxRadius) {
      try {
        console.log(
          `Searching with radius: ${currentRadius}m (attempt ${attempts + 1})`
        );

        // Search for auto repair shops
        const searchUrl = `${PLACES_API_BASE_URL}/nearbysearch/json?location=${latitude},${longitude}&radius=${currentRadius}&type=car_repair&key=${GOOGLE_PLACES_API_KEY}`;

        console.log(
          "Making Places API request to:",
          searchUrl.replace(GOOGLE_PLACES_API_KEY, "API_KEY_HIDDEN")
        );

        const response = await fetch(searchUrl);
        const data = await response.json();

        console.log("Places API Response Status:", data.status);

        if (data.status === "OK") {
          console.log(`Found ${data.results.length} nearby mechanics`);
          const places: PlaceResult[] = data.results.map((place: any) => {
            const distance = this.calculateDistance(
              latitude,
              longitude,
              place.geometry.location.lat,
              place.geometry.location.lng
            );

            return {
              id: place.place_id,
              name: place.name,
              address: place.vicinity || place.formatted_address,
              latitude: place.geometry.location.lat,
              longitude: place.geometry.location.lng,
              rating: place.rating,
              reviewCount: place.user_ratings_total,
              isOpen: place.opening_hours?.open_now,
              photoUrl: place.photos?.[0]?.photo_reference
                ? `${PLACES_API_BASE_URL}/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                : undefined,
              priceLevel: place.price_level,
              distance,
            };
          });

          const sortedPlaces = places.sort(
            (a, b) => (a.distance || 0) - (b.distance || 0)
          );

          // If we have enough results or reached max attempts, return
          if (
            sortedPlaces.length >= minResults ||
            attempts === maxAttempts - 1
          ) {
            return sortedPlaces;
          }

          // Otherwise, expand radius and try again
          currentRadius *= 2;
          attempts++;
          console.log(
            `Only found ${sortedPlaces.length} mechanics, expanding search radius to ${currentRadius}m`
          );
        } else {
          console.error("Places API Error:", data.status, data.error_message);
          if (data.status === "REQUEST_DENIED") {
            console.error(
              "API Key Issue: Check your Google Cloud Console settings"
            );
            console.error("1. Ensure Places API is enabled");
            console.error(
              "2. Check API key restrictions (iOS bundle ID: com.bryce512.Mychanic)"
            );
            console.error("3. Verify billing is enabled on your project");
          }
          console.log("Falling back to mock data due to API error");
          return getMockMechanicData(latitude, longitude);
        }
      } catch (error) {
        console.error("Error fetching nearby mechanics:", error);
        break; // Exit loop on network error
      }
    }

    // Final fallback
    console.log("Falling back to mock data due to insufficient results");
    return getMockMechanicData(latitude, longitude);
  }
  static async getPlaceDetails(placeId: string): Promise<any> {
    try {
      const detailsUrl = `${PLACES_API_BASE_URL}/details/json?place_id=${placeId}&fields=name,rating,formatted_phone_number,website,opening_hours,photos,reviews&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(detailsUrl);
      const data = await response.json();

      if (data.status === "OK") {
        return data.result;
      } else {
        console.error("Place Details Error:", data.status, data.error_message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  }

  // Alternative search by text (for search functionality)
  static async searchMechanicsByText(
    query: string,
    latitude: number,
    longitude: number,
    radius: number = 10000
  ): Promise<PlaceResult[]> {
    try {
      const searchUrl = `${PLACES_API_BASE_URL}/textsearch/json?query=${encodeURIComponent(
        query + " auto repair mechanic"
      )}&location=${latitude},${longitude}&radius=${radius}&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.status === "OK") {
        const places: PlaceResult[] = data.results.map((place: any) => {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            place.geometry.location.lat,
            place.geometry.location.lng
          );

          return {
            id: place.place_id,
            name: place.name,
            address: place.formatted_address,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            rating: place.rating,
            reviewCount: place.user_ratings_total,
            isOpen: place.opening_hours?.open_now,
            photoUrl: place.photos?.[0]?.photo_reference
              ? `${PLACES_API_BASE_URL}/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
              : undefined,
            priceLevel: place.price_level,
            distance,
          };
        });

        return places.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      } else {
        console.error("Text Search Error:", data.status, data.error_message);
        return [];
      }
    } catch (error) {
      console.error("Error searching mechanics:", error);
      return [];
    }
  }
}

// Mock data fallback when API key is not configured
export const getMockMechanicData = (
  latitude: number,
  longitude: number
): PlaceResult[] => {
  const mockData = [
    {
      id: "1",
      name: "Precision Auto Care",
      address: "123 Main St, Austin, TX",
      latitude: latitude + 0.01,
      longitude: longitude + 0.01,
      rating: 4.8,
      reviewCount: 243,
      isOpen: true,
      distance: 1.2,
    },
    {
      id: "2",
      name: "Hometown Mechanics",
      address: "456 Oak Ave, Austin, TX",
      latitude: latitude + 0.02,
      longitude: longitude - 0.01,
      rating: 4.6,
      reviewCount: 187,
      isOpen: false,
      distance: 2.4,
    },
    {
      id: "3",
      name: "AutoTech Solutions",
      address: "789 Pine Rd, Austin, TX",
      latitude: latitude - 0.01,
      longitude: longitude + 0.02,
      rating: 4.9,
      reviewCount: 311,
      isOpen: true,
      distance: 3.1,
    },
    {
      id: "4",
      name: "Quick Lube Express",
      address: "321 Elm St, Austin, TX",
      latitude: latitude + 0.015,
      longitude: longitude - 0.015,
      rating: 4.2,
      reviewCount: 156,
      isOpen: true,
      distance: 1.8,
    },
    {
      id: "5",
      name: "Expert Auto Repair",
      address: "654 Maple Dr, Austin, TX",
      latitude: latitude - 0.015,
      longitude: longitude - 0.01,
      rating: 4.7,
      reviewCount: 298,
      isOpen: false,
      distance: 2.9,
    },
  ];

  return mockData.sort((a, b) => a.distance - b.distance);
};
