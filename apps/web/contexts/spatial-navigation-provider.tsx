'use client';

import { useEffect, useState } from 'react';
import { init, SpatialNavigation } from '@noriginmedia/norigin-spatial-navigation';

export function SpatialNavigationProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      init({
        debug: true,
        visualDebug: false,
        shouldFocusDOMNode: false,
      });
      setIsInitialized(true);
      console.log('[SpatialNav] TV Spatial Navigation Initialized');

      // After all components on the page mount and register their layout,
      // manually set focus to the first nav item
      const t = setTimeout(() => {
        console.log('[SpatialNav] Setting initial focus to nav-item-first');
        SpatialNavigation.setFocus('nav-item-first');
      }, 400);

      return () => clearTimeout(t);
    }
  }, [isInitialized]);

  return <>{children}</>;
}
