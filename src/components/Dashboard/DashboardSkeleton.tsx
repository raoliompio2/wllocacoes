import React from 'react';
import { Grid, Paper, Box, Card, CardContent, Typography } from '@mui/material';
import { SkeletonLoader } from '../common/SkeletonLoadingProvider';

/**
 * Componente de Skeleton Loading específico para o Dashboard
 */
const DashboardSkeleton: React.FC = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Cards de resumo */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 140,
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%',
                    mr: 2 
                  }}
                  className="skeleton-pulse"
                />
                <Box sx={{ width: '60%' }} className="skeleton-pulse" height={24} />
              </Box>
              <Box sx={{ my: 1, height: 36 }} className="skeleton-pulse" />
              <Box sx={{ mt: 'auto', height: 16, width: '40%' }} className="skeleton-pulse" />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ mb: 2, height: 32, width: '30%' }} className="skeleton-pulse" />
            <Box sx={{ height: 300 }} className="skeleton-pulse" />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ mb: 2, height: 32, width: '30%' }} className="skeleton-pulse" />
            <Box sx={{ height: 300 }} className="skeleton-pulse" />
          </Paper>
        </Grid>
      </Grid>

      {/* Tabela ou lista */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ mb: 2, height: 32, width: '30%' }} className="skeleton-pulse" />
            <SkeletonLoader type="table" count={5} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ mb: 2, height: 32, width: '30%' }} className="skeleton-pulse" />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} variant="outlined" sx={{ borderRadius: 1 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%',
                          mr: 1 
                        }}
                        className="skeleton-pulse"
                      />
                      <Box sx={{ width: '60%' }} className="skeleton-pulse" height={20} />
                    </Box>
                    <Box sx={{ height: 16, mb: 1 }} className="skeleton-pulse" />
                    <Box sx={{ height: 16, width: '70%' }} className="skeleton-pulse" />
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardSkeleton; 