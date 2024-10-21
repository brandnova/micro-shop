// src/hooks/useScrollToTop.js
import { useState, useEffect } from 'react';

export const useScrollToTop = () => {
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);

  useEffect(() => {
    const toggleScrollButtonVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsScrollButtonVisible(true);
      } else {
        setIsScrollButtonVisible(false);
      }
    };

    window.addEventListener('scroll', toggleScrollButtonVisibility);
    return () => window.removeEventListener('scroll', toggleScrollButtonVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return { isScrollButtonVisible, scrollToTop };
};