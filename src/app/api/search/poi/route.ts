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
}

// Rate limiting: store last request time per IP
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 1000; // 1 second between requests

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

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
    nominatimUrl.searchParams.set('limit', limit.toString());
    nominatimUrl.searchParams.set('addressdetails', '1');
    nominatimUrl.searchParams.set('extratags', '1');

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

    // Transform to our format
    const results: LocationCandidate[] = data.map((item) => ({
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
      type: item.type,
      importance: item.importance,
      place_id: item.place_id,
    }));

    return NextResponse.json({ results });

  } catch (error) {
    console.error('POI search error:', error);
    return NextResponse.json(
      { error: 'Failed to search locations' },
      { status: 500 }
    );
  }
}
