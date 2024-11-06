import { useState, useEffect } from 'react';

// Rate limiting implementation
export const useRateLimit = (limit: number, windowMs: number) => {
  const [attempts, setAttempts] = useState<number[]>([]);

  useEffect(() => {
    const now = Date.now();
    setAttempts(prev => prev.filter(timestamp => now - timestamp < windowMs));
  }, [windowMs]);

  const isRateLimited = () => {
    const now = Date.now();
    setAttempts(prev => [...prev, now]);
    return attempts.length >= limit;
  };

  return isRateLimited;
};

// Input validation
export const validateProfileLink = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.hostname === 'society.ton.org' &&
      parsedUrl.pathname.startsWith('/profile/') &&
      parsedUrl.pathname.length > 9
    );
  } catch {
    return false;
  }
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
};

// Error messages
export const ErrorMessages = {
  INVALID_URL: 'Please enter a valid TON Society profile URL',
  RATE_LIMITED: 'Too many attempts. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
};