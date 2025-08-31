import { Timestamp } from 'firebase/firestore';

// User Types
export interface UserDoc {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Map Types
export interface MapCategory {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface MapStats {
  views: number;
  comments: number;
  likes: number;
}

export interface MapDoc {
  id?: string;
  ownerId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  mainLocation?: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublicLinkEnabled: boolean;
  shareId?: string;
  shareSettings?: {
    shareType: 'private' | 'public' | 'password';
    password?: string;
    isEnabled: boolean;
  };
  stats: MapStats;
  categories: MapCategory[];
  tags?: string[];
}

// Marker Types
export interface MarkerIcon {
  library: 'default' | 'heroicons';
  name: string;
  color?: string;
  markerType?: 'pin' | 'circle';
}

export interface MarkerDoc {
  id?: string;
  mapId: string; // Reference to the parent map
  title: string;
  categoryId?: string;
  lat: number;
  lng: number;
  address?: string;
  description?: string;
  tips?: string[];
  icon?: MarkerIcon;
  images?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Shape Types
export interface ShapeStyle {
  color?: string;
  weight?: number;
  fill?: string;
}

export interface ShapeDoc {
  id?: string;
  type: 'polygon' | 'polyline' | 'rectangle' | 'circle';
  geo: any; // GeoJSON or encoded coords
  style?: ShapeStyle;
  label?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Share Types
export interface ShareDoc {
  id?: string;
  mapId: string;
  ownerId: string;
  publicId: string;
  mode: 'link' | 'link+password';
  passwordHash?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Comment and Like Types
export interface CommentDoc {
  id?: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
}

export interface LikeDoc {
  id?: string;
  userId: string;
  createdAt: Timestamp;
}

// Membership Types
export interface MembershipDoc {
  id?: string;
  mapId: string;
  mapTitle: string;
  mapDescription?: string;
  ownerId: string;
  ownerName?: string;
  sharedAt: Timestamp;
  lastViewedAt?: Timestamp;
}

// API Types
export interface ShareRequest {
  mapId: string;
  mode: 'link' | 'link+password';
  password?: string;
  notifyTargets?: string[]; // email/SMS targets
}

export interface ShareResponse {
  publicId: string;
  shareUrl: string;
}

export interface VerifyRequest {
  publicId: string;
  password: string;
}

export interface VerifyResponse {
  success: boolean;
  sessionToken?: string;
}

// Location Search Types
export interface LocationCandidate {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  place_id: string;
  distance?: number;
}

// Form Types
export interface CreateMapForm {
  title: string;
  description?: string;
  tags?: string;
}

export interface MarkerForm {
  title: string;
  categoryId?: string;
  address?: string;
  description?: string;
  tips: string;
  icon?: MarkerIcon;
}

export interface CategoryForm {
  name: string;
  color?: string;
  icon?: string;
}
