'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to safely check if we're running on the client side
 * Prevents hydration mismatches by ensuring consistent server/client rendering
 */
export const useClientSide = (): boolean => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};