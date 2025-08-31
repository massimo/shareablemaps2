// Marker category definitions with icons and metadata
export interface Category {
  id: string;
  name: string;
  icon: string; // Heroicons name or emoji
  description?: string;
}

export const MARKER_CATEGORIES: Category[] = [
  {
    id: 'restaurants',
    name: 'Restaurants',
    icon: '🍽️',
    description: 'Dining establishments and restaurants'
  },
  {
    id: 'cafes-coffee',
    name: 'Cafés & Coffee',
    icon: '☕',
    description: 'Coffee shops and cafés'
  },
  {
    id: 'bars-pubs',
    name: 'Bars & Pubs',
    icon: '🍺',
    description: 'Bars, pubs, and drinking establishments'
  },
  {
    id: 'groceries-supermarkets',
    name: 'Groceries & Supermarkets',
    icon: '🛒',
    description: 'Grocery stores and supermarkets'
  },
  {
    id: 'attractions-landmarks',
    name: 'Attractions & Landmarks',
    icon: '🏛️',
    description: 'Tourist attractions and landmarks'
  },
  {
    id: 'public-transport',
    name: 'Public Transport',
    icon: '🚇',
    description: 'Metro, train, tram, and bus stations'
  },
  {
    id: 'parking',
    name: 'Parking',
    icon: '🅿️',
    description: 'Parking lots and garages'
  },
  {
    id: 'toilets-facilities',
    name: 'Toilets & Facilities',
    icon: '🚻',
    description: 'Public restrooms and facilities'
  },
  {
    id: 'hotels-stays',
    name: 'Hotels & Stays',
    icon: '🏨',
    description: 'Hotels and accommodation'
  },
  {
    id: 'parks-gardens',
    name: 'Parks & Gardens',
    icon: '🌳',
    description: 'Parks, gardens, and green spaces'
  },
  {
    id: 'museums-galleries',
    name: 'Museums & Galleries',
    icon: '🖼️',
    description: 'Museums and art galleries'
  },
  {
    id: 'shops-boutiques',
    name: 'Shops & Boutiques',
    icon: '🛍️',
    description: 'Retail shops and boutiques'
  },
  {
    id: 'bakeries-desserts',
    name: 'Bakeries & Desserts',
    icon: '🧁',
    description: 'Bakeries and dessert shops'
  },
  {
    id: 'pharmacies-health',
    name: 'Pharmacies & Health',
    icon: '💊',
    description: 'Pharmacies and health services'
  },
  {
    id: 'atms-banks',
    name: 'ATMs & Banks',
    icon: '🏦',
    description: 'ATMs and banking services'
  },
  {
    id: 'wifi-spots',
    name: 'Wi-Fi Spots',
    icon: '📶',
    description: 'Free Wi-Fi locations'
  },
  {
    id: 'ev-charging-fuel',
    name: 'EV Charging & Fuel',
    icon: '⚡',
    description: 'Electric vehicle charging and fuel stations'
  },
  {
    id: 'markets-delis',
    name: 'Markets & Delis',
    icon: '🥖',
    description: 'Markets and delicatessens'
  },
  {
    id: 'street-food-trucks',
    name: 'Street Food & Food Trucks',
    icon: '🚚',
    description: 'Street food and food trucks'
  },
  {
    id: 'playgrounds',
    name: 'Playgrounds',
    icon: '🎠',
    description: 'Playgrounds and play areas'
  },
  {
    id: 'hikes-trails',
    name: 'Hikes & Trails',
    icon: '🥾',
    description: 'Hiking trails and walking paths'
  },
  {
    id: 'sports-gyms',
    name: 'Sports & Gyms',
    icon: '💪',
    description: 'Gyms and sports facilities'
  },
  {
    id: 'nightlife-clubs',
    name: 'Nightlife & Clubs',
    icon: '🌙',
    description: 'Nightlife and clubs'
  },
  {
    id: 'theatres-cinemas',
    name: 'Theatres & Cinemas',
    icon: '🎭',
    description: 'Theatres and cinemas'
  }
];

// Helper function to get category by ID
export function getCategoryById(id: string): Category | undefined {
  return MARKER_CATEGORIES.find(category => category.id === id);
}

// Helper function to get category name by ID
export function getCategoryName(id: string): string {
  const category = getCategoryById(id);
  return category ? category.name : 'Uncategorized';
}
