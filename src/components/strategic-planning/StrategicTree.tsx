'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  LinearProgress,
  useTheme
} from '@mui/material';
import { Icon, IconName, iconColors } from '@/components/common/Icons';
import { colors } from '@/styles/colors';
import { Perspective, Program, StrategicAction } from '@/types/strategic-planning';

interface TreeItemProps {
  label: string;
  description?: string;
  progress?: number;
  icon?: IconName;
  children?: React.ReactNode;
  level: number;
  defaultExpanded?: boolean;
}

const TreeItem: React.FC<TreeItemProps> = ({
  label,
  description,
  progress,
  icon,
  children,
  level,
  defaultExpanded = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const theme = useTheme();
  const hasChildren = React.Children.count(children) > 0;

  return (
    <Box sx={{ mb: 1 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: theme.palette.mode === 'dark'
            ? `rgba(255, 255, 255, ${0.05 - level * 0.01})`
            : `rgba(0, 0, 0, ${0.02 + level * 0.01})`,
          borderRadius: 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark'
              ? `rgba(255, 255, 255, ${0.08 - level * 0.01})`
              : `rgba(0, 0, 0, ${0.04 + level * 0.01})`,
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          {hasChildren && (
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ mt: 0.5 }}
            >
              <Icon
                name={expanded ? 'expand_less' : 'expand_more'}
                size="small"
                color={theme.palette.text.secondary}
              />
            </IconButton>
          )}
          
          {icon && (
            <Box sx={{ mt: 0.5 }}>
              <Icon
                name={icon}
                size="medium"
                color={iconColors[icon]}
              />
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={500}>
              {label}
            </Typography>
            
            {description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {description}
              </Typography>
            )}

            {progress !== undefined && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    Progresso
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: `${theme.palette.primary.main}20`,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.primary.main
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 4, mt: 1 }}>
            {children}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

interface StrategicTreeProps {
  data: {
    perspectives: Perspective[];
    programs: Program[];
    actions: StrategicAction[];
  };
}

export const StrategicTree: React.FC<StrategicTreeProps> = ({ data }) => {
  return (
    <Box>
      {data.perspectives.map((perspective) => (
        <TreeItem
          key={perspective.id}
          label={perspective.name}
          description={perspective.description}
          progress={perspective.progress}
          icon="perspective"
          level={0}
          defaultExpanded
        >
          {data.programs
            .filter((program) => program.perspectiveId === perspective.id)
            .map((program) => (
              <TreeItem
                key={program.id}
                label={program.name}
                description={program.description}
                progress={program.progress}
                icon="program"
                level={1}
              >
                {data.actions
                  .filter((action) => action.programId === program.id)
                  .map((action) => (
                    <TreeItem
                      key={action.id}
                      label={action.name}
                      description={action.description}
                      progress={action.progress}
                      icon="action"
                      level={2}
                    />
                  ))}
              </TreeItem>
            ))}
        </TreeItem>
      ))}
    </Box>
  );
}; 