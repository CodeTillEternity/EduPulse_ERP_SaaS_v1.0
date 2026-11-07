import { useState, useEffect } from 'react';

/**
 * Custom React hook ensuring the official Razorpay Checkout SDK is loaded
 * into the DOM document.
 *
 * @returns {boolean} True if window.Razorpay is loaded and available
 */
export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(() => typeof window !== 'undefined' && Boolean(window.Razorpay));

  useEffect(() => {
    if (typeof window === 'undefined' || window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay Checkout SDK.');
    document.body.appendChild(script);
  }, []);

  return isLoaded;
}

export default useRazorpay;
