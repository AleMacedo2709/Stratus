'use client';

import React from 'react';
import { Avatar as MuiAvatar, AvatarProps as MuiAvatarProps } from '@mui/material';
import { Image } from './Image';
import { graphService } from '@/services/auth/MicrosoftGraphService';

interface AvatarProps extends Omit<MuiAvatarProps, 'src'> {
  email?: string;
  name?: string;
  size?: number;
  src?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  email,
  name,
  size = 40,
  src,
  ...props
}) => {
  const [photoUrl, setPhotoUrl] = React.useState<string | undefined>(src);

  React.useEffect(() => {
    if (email && !src) {
      const fetchPhoto = async () => {
        try {
          const url = await graphService.getUserPhotoByEmail(email);
          setPhotoUrl(url);
        } catch (error) {
          console.warn('Error fetching user photo:', error);
        }
      };
      fetchPhoto();
    }
  }, [email, src]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!photoUrl) {
    return (
      <MuiAvatar
        {...props}
        sx={{
          width: size,
          height: size,
          fontSize: size * 0.4,
          ...props.sx
        }}
      >
        {name ? getInitials(name) : '?'}
      </MuiAvatar>
    );
  }

  return (
    <MuiAvatar
      {...props}
      sx={{
        width: size,
        height: size,
        ...props.sx
      }}
    >
      <Image
        src={photoUrl}
        alt={name || 'Avatar'}
        width={size}
        height={size}
        fallbackSrc="/images/default-avatar.png"
        objectFit="cover"
      />
    </MuiAvatar>
  );
}; 