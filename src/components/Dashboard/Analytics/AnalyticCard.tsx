import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface AnalyticCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

const AnalyticCard: React.FC<AnalyticCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent>
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          {trend && (
            <div className={`flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="text-sm font-medium">
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
        <Typography variant="h5" component="div" className="mt-4 font-bold">
          {value}
        </Typography>
        <Typography color="textSecondary" className="text-sm">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AnalyticCard;