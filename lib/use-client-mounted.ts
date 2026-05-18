import { useEffect, useState } from 'react';

/** True after the component has mounted on the client (avoids SSR/extension hydration mismatches on forms). */
export function useClientMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
