import * as DevOps from 'azure-devops-extension-sdk';
import { useEffect } from 'react';

function useResizeTimeout(interval: number): void {
  useEffect(() => {
    const timer = setTimeout(() => {
      DevOps.resize();
    }, interval);
    return () => clearTimeout(timer);
  }, []);
}

export default useResizeTimeout;
