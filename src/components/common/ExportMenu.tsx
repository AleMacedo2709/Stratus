import React from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Tooltip 
} from '@mui/material';
import { Icon, iconColors } from './Icons';

interface ExportMenuProps {
  onExport: (format: 'pdf' | 'excel' | 'powerpoint') => void;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ onExport }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'powerpoint') => {
    onExport(format);
    handleClose();
  };

  const exportOptions = [
    {
      label: 'Exportar como PDF',
      icon: 'pdf',
      onClick: () => handleExport('pdf'),
      color: iconColors.pdf
    },
    {
      label: 'Exportar como Excel',
      icon: 'excel',
      onClick: () => handleExport('excel'),
      color: iconColors.excel
    },
    {
      label: 'Exportar como PowerPoint',
      icon: 'powerpoint',
      onClick: () => handleExport('powerpoint'),
      color: iconColors.powerpoint
    }
  ];

  return (
    <>
      <Tooltip title="Exportar">
        <IconButton onClick={handleClick}>
          <Icon name="download" size="medium" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {exportOptions.map((option) => (
          <MenuItem
            key={option.label}
            onClick={option.onClick}
            sx={{
              minWidth: 200,
              gap: 1,
              '&:hover': {
                '& .MuiListItemIcon-root': {
                  color: option.color
                }
              }
            }}
          >
            <ListItemIcon sx={{ color: 'text.secondary' }}>
              <Icon name={option.icon} size="small" color={option.color} />
            </ListItemIcon>
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}; 