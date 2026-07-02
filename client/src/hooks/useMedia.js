import { useState, useEffect, useCallback } from 'react';
import { fetchMedia } from '../api/media.js';

export function useMedia(autoFetch = true) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMedia();
      setMedia(data.media ?? []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      loadMedia();
    }
  }, [autoFetch, loadMedia]);

  return { media, loading, error, loadMedia, setMedia };
}
