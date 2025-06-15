import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { formatCurrency } from '../../../utils/formatters';

interface Equipment {
  name: string;
  totalBookings: number;
  totalRevenue: number;
  rating: number;
}

interface TopEquipmentTableProps {
  data: Equipment[];
  title: string;
}

const TopEquipmentTable: React.FC<TopEquipmentTableProps> = ({
  data,
  title,
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Equipamento</TableCell>
              <TableCell align="right">Reservas</TableCell>
              <TableCell align="right">Receita</TableCell>
              <TableCell align="right">Avaliação</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.name}</TableCell>
                <TableCell align="right">{item.totalBookings}</TableCell>
                <TableCell align="right">{formatCurrency(item.totalRevenue)}</TableCell>
                <TableCell align="right">{item.rating.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopEquipmentTable;