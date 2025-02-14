import React from 'react';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { Icon } from './Icons';
import { colors } from '@/styles/colors';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: keyof typeof Icons;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
  separator?: string | React.ReactNode;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  onNavigate,
  separator = '/'
}) => {
  const handleClick = (href: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    onNavigate?.(href);
  };

  return (
    <Breadcrumbs
      separator={
        typeof separator === 'string' ? (
          <Typography
            color="text.secondary"
            sx={{ fontSize: '0.875rem' }}
          >
            {separator}
          </Typography>
        ) : (
          separator
        )
      }
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return isLast ? (
          <Typography
            key={item.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: colors.neutral.text,
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            {item.icon && <Icon name={item.icon} size="sm" />}
            {item.label}
          </Typography>
        ) : (
          <Link
            key={item.label}
            href={item.href}
            onClick={item.href ? handleClick(item.href) : undefined}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: colors.primary.main,
              fontSize: '0.875rem',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {item.icon && <Icon name={item.icon} size="sm" />}
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};
