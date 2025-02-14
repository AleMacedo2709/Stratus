'use client';

import React from 'react';
import NextImage from 'next/image';
import { Box, Skeleton } from '@mui/material';

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fallbackSrc = '/images/placeholder.png',
  objectFit = 'cover'
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState(src);

  React.useEffect(() => {
    setImgSrc(src);
    setError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    setError(true);
    setImgSrc(fallbackSrc);
  };

  const aspectRatio = width && height ? width / height : undefined;

  return (
    <Box
      sx={{
        position: 'relative',
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
        aspectRatio: !height ? aspectRatio : undefined,
        overflow: 'hidden',
      }}
      className={className}
    >
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
        />
      )}
      <NextImage
        src={imgSrc}
        alt={alt}
        fill={!width || !height}
        width={width}
        height={height}
        onLoadingComplete={() => setIsLoading(false)}
        onError={handleError}
        priority={priority}
        style={{
          objectFit,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.2s ease-in-out'
        }}
      />
    </Box>
  );
}; 