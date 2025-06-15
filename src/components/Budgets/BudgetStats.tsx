import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  useTheme
} from '@mui/material';
import { 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  FileText,
  CreditCard
} from 'lucide-react';

interface BudgetStatsProps {
  pendingCount: number;
  respondedCount: number;
  approvedCount: number;
  rejectedCount: number;
  convertedCount?: number;
  totalCount: number;
}

const BudgetStats: React.FC<BudgetStatsProps> = ({ 
  pendingCount, 
  respondedCount, 
  approvedCount, 
  rejectedCount,
  convertedCount = 0,
  totalCount 
}) => {
  const theme = useTheme();
  
  const stats = [
    { 
      title: 'Solicitações', 
      count: pendingCount, 
      icon: <Clock size={20} />, 
      color: theme.palette.warning.main
    },
    { 
      title: 'Respondidos', 
      count: respondedCount, 
      icon: <MessageSquare size={20} />, 
      color: theme.palette.info.main
    },
    { 
      title: 'Reservas', 
      count: convertedCount, 
      icon: <CreditCard size={20} />, 
      color: theme.palette.primary.main
    },
    { 
      title: 'Total', 
      count: totalCount, 
      icon: <FileText size={20} />, 
      color: '#757575'
    }
  ];

  return (
    <Box
      sx={{
        mb: 4
      }}
    >
      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center" 
                    sx={{ 
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                      borderRadius: 1,
                      width: 36,
                      height: 36,
                      mr: 1.5
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ lineHeight: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" component="div" fontWeight={600}>
                      {stat.count}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BudgetStats; 