import { NextRequest, NextResponse } from 'next/server';

interface NominatimResult {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: string;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox: string[];
}

interface LocationCandidate {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  place_id: string;
  distance?: number;
}

// Calculate distance between two coordinates using Haversine formula
function getDistanceFromLatLng(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Rate limiting: store last request time per IP
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 1000; // 1 second between requests

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);
    const userLat = searchParams.get('userLat');
    const userLng = searchParams.get('userLng');

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Simple rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const lastRequest = rateLimitMap.get(clientIP);
    const now = Date.now();
    
    if (lastRequest && (now - lastRequest) < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }
    
    rateLimitMap.set(clientIP, now);

    // Build Nominatim URL
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search');
    nominatimUrl.searchParams.set('q', query);
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('limit', (limit * 2).toString()); // Get more results for better sorting
    nominatimUrl.searchParams.set('addressdetails', '1');
    nominatimUrl.searchParams.set('extratags', '1');

    // If user location is provided, add proximity bias
    if (userLat && userLng) {
      nominatimUrl.searchParams.set('viewbox', 
        `${parseFloat(userLng) - 0.1},${parseFloat(userLat) + 0.1},${parseFloat(userLng) + 0.1},${parseFloat(userLat) - 0.1}`
      );
      nominatimUrl.searchParams.set('bounded', '0'); // Don't strictly limit to viewbox
    }

    // Make request to Nominatim
    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': process.env.NOMINATIM_USER_AGENT || 'ShareableMaps/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data: NominatimResult[] = await response.json();

    // Transform to our format and calculate distances
    let results: LocationCandidate[] = data.map((item) => {
      const result: LocationCandidate = {
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        type: item.type,
        importance: item.importance,
        place_id: item.place_id,
      };

      // Calculate distance if user location is provided
      if (userLat && userLng) {
        const distance = getDistanceFromLatLng(
          parseFloat(userLat),
          parseFloat(userLng),
          parseFloat(item.lat),
          parseFloat(item.lon)
        );
        result.distance = distance;
      }

      return result;
    });

    // Sort by proximity if user location is available, otherwise by importance
    if (userLat && userLng) {
      results.sort((a, b) => {
        // First sort by distance (closer is better)
        if (a.distance !== undefined && b.distance !== undefined) {
          const distanceDiff = a.distance - b.distance;
          
          // If distances are very close (within 2km), prefer higher importance
          if (Math.abs(distanceDiff) < 2) {
            return b.importance - a.importance;
          }
          
          return distanceDiff;
        }
        
        // Fallback to importance if distance not available
        return b.importance - a.importance;
      });
    } else {
      // Sort by importance only
      results.sort((a, b) => b.importance - a.importance);
    }

    // Limit final results
    results = results.slice(0, limit);

    return NextResponse.json({ results });

  } catch (error) {
    console.error('POI search error:', error);
    return NextResponse.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    );
  }
}
