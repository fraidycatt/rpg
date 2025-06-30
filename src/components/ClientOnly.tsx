// src/components/ClientOnly.tsx

'use client';

import { useState, useEffect } from 'react';

// This component wraps children that should only be rendered on the client.
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // If the component has not mounted yet (i.e., we are on the server), render nothing.
  if (!hasMounted) {
    return null;
  }

  // Once mounted on the client, render the children.
  return <>{children}</>;
}