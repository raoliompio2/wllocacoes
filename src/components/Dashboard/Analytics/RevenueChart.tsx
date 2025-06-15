import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueData {
  name: string;
  bookings: number;
  budgets: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  title: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title,
}) => {
  return (
    <Card className="h-[400px]">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="bookings" name="Aluguéis" fill="#1976d2" />
            <Bar dataKey="budgets" name="Orçamentos" fill="#2196f3" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;