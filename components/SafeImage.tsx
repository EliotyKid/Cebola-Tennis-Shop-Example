'use client';

import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';

// Sample photos are not deployed, so a missing file falls back to the neutral plate.
export function SafeImage({ alt = '', style, className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  // An error fired before hydration never reaches onError.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) return <span role="img" aria-label={alt} className={`safe-image-plate ${className ?? ''}`} style={style} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} alt={alt} className={className} style={style} onError={() => setFailed(true)} {...props} />;
}
