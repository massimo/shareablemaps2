import React from 'react';
import { LocationCandidate } from '@/types';

export class LocationSearchService {
  private static baseUrl = '/api/search/poi';
  private static abortController: AbortController | null = null;

  static async search(query: string, limit: number = 10): Promise<LocationCandidate[]> {
    // Cancel previous request if still pending
    if (this.abortController) {
      this.abortController.abort();
    }

    // Create new abort controller for this request
    this.abortController = new AbortController();

    try {
      const url = new URL(this.baseUrl, window.location.origin);
      url.searchParams.set('q', query);
      url.searchParams.set('limit', limit.toString());

      const response = await fetch(url.toString(), {
        signal: this.abortController.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment.');
        }
        throw new Error('Failed to search locations');
      }

      const data = await response.json();
      return data.results || [];

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, this is expected
        return [];
      }
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  static cancelPendingRequests() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

// Hook for using location search with proper cleanup
export function useLocationSearch() {
  const searchLocations = React.useCallback(async (query: string, limit?: number) => {
    try {
      return await LocationSearchService.search(query, limit);
    } catch (error) {
      console.error('Location search error:', error);
      return [];
    }
  }, []);

  React.useEffect(() => {
    return () => {
      // Cleanup on unmount
      LocationSearchService.cancelPendingRequests();
    };
  }, []);

  return { searchLocations };
}
