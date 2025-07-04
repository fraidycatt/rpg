// src/components/Icon.tsx

'use client';

import { useState, useEffect } from 'react';

interface IconProps {
  name: string;
  className?: string;
}

export default function Icon({ name, className }: IconProps) {
  const [iconSvg, setIconSvg] = useState<string | null>(null);

  useEffect(() => {
    // This code only runs in the browser
    const fetchIcon = async () => {
      try {
        // We fetch the content of the SVG file directly
        const response = await fetch(`/icons/${name}.svg`);
        if (!response.ok) throw new Error('Icon not found');
        const svgText = await response.text();
        setIconSvg(svgText);
      } catch (error) {
        console.error(`Failed to fetch icon: ${name}`, error);
      }
    };

    fetchIcon();
  }, [name]); // Re-run if the icon name changes

  if (!iconSvg) {
    // Render a placeholder or nothing while loading
    return <span className={className} />;
  }

  // This is safe because we are only rendering SVG text from our own trusted files.
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: iconSvg }}
    />
  );
}