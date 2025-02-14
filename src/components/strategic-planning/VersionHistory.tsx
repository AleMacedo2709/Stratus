import React from 'react';
import {
  Box,
  Typography,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material';
import { Version } from '@/services/strategic/VersioningService';
import { StrategicIcon } from '../common/StrategicIcon';

interface VersionHistoryProps {
  objectiveId: string;
  versions: Version[];
  onCompare: (versionA: string, versionB: string) => void;
  onRestore: (versionId: string) => void;
}

interface VersionDiffDialogProps {
  open: boolean;
  onClose: () => void;
  differences: {
    field: string;
    valueA: any;
    valueB: any;
  }[];
}

const statusColors = {
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'error'
} as const;

const VersionDiffDialog: React.FC<VersionDiffDialogProps> = ({
  open,
  onClose,
  differences
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Comparação de Versões</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {differences.map((diff, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                {diff.field}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Versão A
                  </Typography>
                  <Typography>{JSON.stringify(diff.valueA)}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Versão B
                  </Typography>
                  <Typography>{JSON.stringify(diff.valueB)}</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  objectiveId,
  versions,
  onCompare,
  onRestore
}) => {
  const theme = useTheme();
  const [selectedVersions, setSelectedVersions] = React.useState<string[]>([]);
  const [showDiff, setShowDiff] = React.useState(false);
  const [differences, setDifferences] = React.useState<{
    field: string;
    valueA: any;
    valueB: any;
  }[]>([]);

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      }
      if (prev.length < 2) {
        return [...prev, versionId];
      }
      return [prev[1], versionId];
    });
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompare(selectedVersions[0], selectedVersions[1]);
      setShowDiff(true);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Histórico de Versões</Typography>
        {selectedVersions.length === 2 && (
          <Button
            variant="outlined"
            onClick={handleCompare}
            startIcon={<StrategicIcon type="indicator" size="small" />}
          >
            Comparar Versões
          </Button>
        )}
      </Box>

      <Timeline>
        {versions.map((version, index) => (
          <TimelineItem key={version.id}>
            <TimelineSeparator>
              <TimelineDot 
                sx={{ 
                  bgcolor: selectedVersions.includes(version.id) 
                    ? theme.palette.primary.main 
                    : theme.palette.grey[400]
                }}
              />
              {index < versions.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => handleVersionSelect(version.id)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">
                    Versão {version.version}
                  </Typography>
                  <Chip
                    size="small"
                    label={version.status}
                    color={statusColors[version.status]}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {new Date(version.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body2">{version.comment}</Typography>
                {version.changes.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Campos alterados:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      {version.changes.map((change, i) => (
                        <Chip
                          key={i}
                          label={change.field}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                {version.version > 1 && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestore(version.id);
                      }}
                    >
                      Restaurar esta versão
                    </Button>
                  </Box>
                )}
              </Box>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      <VersionDiffDialog
        open={showDiff}
        onClose={() => setShowDiff(false)}
        differences={differences}
      />
    </Box>
  );
}; 