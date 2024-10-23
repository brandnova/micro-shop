import { useState, useEffect } from 'react';
import axios from 'axios';

export const useSiteSettings = () => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await axios.get('/api/site-settings/');
        setSiteSettings(response.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  return { siteSettings, loading, error };
};