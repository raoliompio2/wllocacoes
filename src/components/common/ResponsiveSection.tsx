import React from 'react';
import { Box, Typography, Paper, useTheme, useMediaQuery } from '@mui/material';

interface ResponsiveSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  action?: React.ReactNode;
  fullWidth?: boolean;
  noShadow?: boolean;
  noBorder?: boolean;
}

const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({
  title,
  subtitle,
  children,
  className = '',
  noPadding = false,
  action,
  fullWidth = false,
  noShadow = false,
  noBorder = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper
      elevation={noShadow ? 0 : 1}
      sx={{
        mb: isMobile ? 4 : 5,
        border: noBorder ? 'none' : '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        width: fullWidth ? '100%' : 'auto',
        overflow: 'hidden',
      }}
      className={`responsive-section ${className}`}
    >
      {title && (
        <Box
          sx={{
            p: isMobile ? 3 : isTablet ? 4 : 5,
            pb: subtitle ? 2 : noPadding ? 0 : 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: noPadding ? 'none' : '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box>{action}</Box>}
        </Box>
      )}
      <Box
        sx={{
          p: noPadding ? 0 : isMobile ? 3 : isTablet ? 4 : 5,
          pt: title && !noPadding ? (isMobile ? 2 : 3) : noPadding ? 0 : (isMobile ? 3 : isTablet ? 4 : 5),
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default ResponsiveSection; 