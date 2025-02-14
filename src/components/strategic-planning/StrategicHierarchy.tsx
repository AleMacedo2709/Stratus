import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { StrategicIcon } from '../common/StrategicIcon';
import { elementColors } from '@/styles/colors';

interface HierarchyNode {
  id: string;
  type: 'perspective' | 'program' | 'objective' | 'initiative';
  name: string;
  progress?: number;
  status?: 'on_track' | 'at_risk' | 'behind' | 'completed';
  children?: HierarchyNode[];
}

interface StrategicHierarchyProps {
  data: HierarchyNode;
  onNodeClick?: (node: HierarchyNode) => void;
}

const HierarchyLevel: React.FC<{
  node: HierarchyNode;
  isRoot?: boolean;
  onNodeClick?: (node: HierarchyNode) => void;
}> = ({ node, isRoot = false, onNodeClick }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        '&:before': !isRoot ? {
          content: '""',
          position: 'absolute',
          top: -20,
          width: 2,
          height: 20,
          bgcolor: 'divider',
        } : {},
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 2,
          minWidth: 200,
          maxWidth: 300,
          cursor: onNodeClick ? 'pointer' : 'default',
          borderLeft: 4,
          borderColor: elementColors[node.type],
          '&:hover': onNodeClick ? {
            boxShadow: theme.shadows[4],
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          } : {},
        }}
        onClick={() => onNodeClick?.(node)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <StrategicIcon type={node.type} size="small" />
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.name}
          </Typography>
        </Box>
        {(node.progress !== undefined || node.status) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {node.progress !== undefined && (
              <Typography variant="body2" color="text.secondary">
                {node.progress}%
              </Typography>
            )}
            {node.status && (
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.getContrastText(elementColors[node.type]),
                  bgcolor: elementColors[node.type],
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                }}
              >
                {node.status}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
      {node.children && node.children.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            mt: 3,
            position: 'relative',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: -20,
              left: '50%',
              width: '80%',
              height: 2,
              bgcolor: 'divider',
              transform: 'translateX(-50%)',
            },
          }}
        >
          {node.children.map((child) => (
            <HierarchyLevel
              key={child.id}
              node={child}
              onNodeClick={onNodeClick}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export const StrategicHierarchy: React.FC<StrategicHierarchyProps> = ({
  data,
  onNodeClick,
}) => {
  return (
    <Box
      sx={{
        p: 4,
        overflowX: 'auto',
        minWidth: 0,
      }}
    >
      <HierarchyLevel
        node={data}
        isRoot
        onNodeClick={onNodeClick}
      />
    </Box>
  );
}; 