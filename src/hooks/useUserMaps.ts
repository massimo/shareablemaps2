import { useState, useEffect } from 'react';
import { MapDoc } from '@/types';
import { getUserMaps } from '@/lib/mapService';
import { useAuth } from '@/components/auth/AuthProvider';

export function useUserMaps() {
  const { user } = useAuth();
  const [maps, setMaps] = useState<MapDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaps = async () => {
    if (!user) {
      setMaps([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userMaps = await getUserMaps(user.uid);
      setMaps(userMaps);
    } catch (err) {
      console.error('Error fetching user maps:', err);
      setError('Failed to load maps');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaps();
  }, [user?.uid]);

  const refetch = () => {
    fetchMaps();
  };

  return {
    maps,
    isLoading,
    error,
    refetch,
  };
}
