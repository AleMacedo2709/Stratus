import React from 'react';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { Icon, IconName, iconColors } from '@/components/common/Icons';

interface BreadcrumbItem {
  type: IconName;
  id: string;
  name: string;
  href: string;
}

interface StrategicBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const StrategicBreadcrumb: React.FC<StrategicBreadcrumbProps> = ({ items }) => {
  return (
    <Breadcrumbs
      separator={<Icon name="next" size="small" />}
      aria-label="strategic breadcrumb"
      sx={{
        '& .MuiBreadcrumbs-separator': {
          mx: 1
        }
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const content = (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: isLast ? 'text.primary' : 'text.secondary',
              '&:hover': !isLast && {
                color: 'primary.main',
                '& .icon': {
                  color: 'primary.main'
                }
              }
            }}
          >
            <Icon
              name={item.type}
              size="small"
              color={isLast ? iconColors[item.type] : undefined}
              className="icon"
            />
            <Typography
              variant="body2"
              sx={{
                fontWeight: isLast ? 500 : 400
              }}
            >
              {item.name}
            </Typography>
          </Box>
        );

        return isLast ? (
          <Box key={item.id}>{content}</Box>
        ) : (
          <Link
            key={item.id}
            href={item.href}
            underline="none"
            color="inherit"
          >
            {content}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}; 