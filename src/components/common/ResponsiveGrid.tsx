import React from 'react';
import { Grid, useTheme, useMediaQuery } from '@mui/material';

type GridSpacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type GridSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface ResponsiveGridProps {
  children: React.ReactNode;
  spacing?: GridSpacing;
  spacingX?: GridSpacing;
  spacingY?: GridSpacing;
  container?: boolean;
  item?: boolean;
  xs?: GridSize;
  sm?: GridSize;
  md?: GridSize;
  lg?: GridSize;
  xl?: GridSize;
  className?: string;
  [key: string]: any;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  spacing = 3,
  spacingX,
  spacingY,
  container = true,
  item = false,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  className = '',
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Definições de grid adaptadas para mobile
  const gridProps = {
    // Se for container
    ...(container && {
      container: true,
      spacing: isMobile ? Math.max(2, spacing - 1) : spacing,
      columnSpacing: spacingX !== undefined ? (isMobile ? Math.max(2, spacingX - 1) : spacingX) : undefined,
      rowSpacing: spacingY !== undefined ? (isMobile ? Math.max(2, spacingY - 1) : spacingY) : undefined
    }),
    // Se for item
    ...(item && {
      item: true,
      xs, 
      sm, 
      md, 
      lg, 
      xl
    })
  };

  return (
    <Grid className={`responsive-grid ${className}`} {...gridProps} {...props}>
      {children}
    </Grid>
  );
};

// Componente para criar itens de grid com base em tamanhos de tela
export const GridItem: React.FC<ResponsiveGridProps> = (props) => {
  return <ResponsiveGrid item={true} container={false} {...props} />;
};

export default ResponsiveGrid; 