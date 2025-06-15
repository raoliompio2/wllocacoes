import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BookingData {
  date: string;
  value: number;
}

interface BookingChartProps {
  data: BookingData[];
  title: string;
  color?: string;
}

const BookingChart: React.FC<BookingChartProps> = ({
  data,
  title,
  color = '#1976d2',
}) => {
  return (
    <Card className="h-[400px]">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BookingChart;