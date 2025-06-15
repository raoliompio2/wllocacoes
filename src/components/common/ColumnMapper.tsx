import * as React from 'react';
import { useState, useEffect } from 'react';
import { FormControl, InputLabel, MenuItem, Select, Typography, Button, Paper } from '@mui/material';
import { MoveRight } from 'lucide-react';

interface ColumnMapperProps {
  csvHeaders: string[];
  databaseFields: { name: string; label: string; required?: boolean }[];
  onMappingComplete: (mapping: Record<string, string>) => void;
  initialMapping?: Record<string, string>;
}

const ColumnMapper: React.FC<ColumnMapperProps> = ({
  csvHeaders,
  databaseFields,
  onMappingComplete,
  initialMapping = {},
}) => {
  const [mapping, setMapping] = useState<Record<string, string>>(initialMapping);
  const [isValid, setIsValid] = useState(false);

  // Verifica se o mapeamento está válido (todos os campos obrigatórios estão mapeados)
  useEffect(() => {
    const requiredFields = databaseFields.filter(field => field.required).map(field => field.name);
    const isMappingValid = requiredFields.every(field => mapping[field] && mapping[field].trim() !== '');
    setIsValid(isMappingValid);
  }, [mapping, databaseFields]);

  const handleMappingChange = (dbField: string, csvHeader: string) => {
    setMapping(prev => ({
      ...prev,
      [dbField]: csvHeader
    }));
  };

  const handleAutoMap = () => {
    // Tenta mapear automaticamente campos com nomes semelhantes
    const autoMapping: Record<string, string> = {};
    
    databaseFields.forEach(dbField => {
      // Tenta encontrar uma correspondência exata primeiro
      const exactMatch = csvHeaders.find(header => 
        header.toLowerCase() === dbField.name.toLowerCase() || 
        header.toLowerCase() === dbField.label.toLowerCase()
      );
      
      if (exactMatch) {
        autoMapping[dbField.name] = exactMatch;
        return;
      }
      
      // Tenta encontrar uma correspondência parcial
      const partialMatch = csvHeaders.find(header => 
        header.toLowerCase().includes(dbField.name.toLowerCase()) || 
        dbField.name.toLowerCase().includes(header.toLowerCase()) ||
        header.toLowerCase().includes(dbField.label.toLowerCase()) ||
        dbField.label.toLowerCase().includes(header.toLowerCase())
      );
      
      if (partialMatch) {
        autoMapping[dbField.name] = partialMatch;
      }
    });
    
    setMapping(autoMapping);
  };

  const clearMapping = () => {
    setMapping({});
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4">
        <Typography variant="h6" className="mb-3">
          Mapeamento de Colunas
        </Typography>
        <div className="space-x-2">
          <Button variant="outlined" color="primary" size="small" onClick={handleAutoMap}>
            Mapear Automaticamente
          </Button>
          <Button variant="outlined" color="secondary" size="small" onClick={clearMapping}>
            Limpar
          </Button>
        </div>
      </div>

      <Paper elevation={2} className="p-4 mb-4">
        <Typography variant="body2" className="mb-4">
          Selecione a qual coluna do CSV corresponde cada campo do banco de dados.
          <br />
          <span className="text-red-500">*</span> Campos obrigatórios.
        </Typography>

        <div className="space-y-4">
          {databaseFields.map((field) => (
            <div key={field.name} className="flex items-center gap-4">
              <div className="flex-1">
                <Typography className="font-medium">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Typography>
              </div>
              
              <div className="flex-none">
                <MoveRight size={20} className="text-gray-400" />
              </div>
              
              <div className="flex-1">
                <FormControl fullWidth size="small">
                  <InputLabel>Coluna CSV</InputLabel>
                  <Select
                    value={mapping[field.name] || ''}
                    label="Coluna CSV"
                    onChange={(e) => handleMappingChange(field.name, e.target.value as string)}
                  >
                    <MenuItem value="">
                      <em>Não mapear</em>
                    </MenuItem>
                    {csvHeaders.map((header) => (
                      <MenuItem key={header} value={header}>
                        {header}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
          ))}
        </div>
      </Paper>

      <div className="flex justify-end">
        <Button
          variant="contained"
          color="primary"
          disabled={!isValid}
          onClick={() => onMappingComplete(mapping)}
        >
          Confirmar Mapeamento
        </Button>
      </div>
    </div>
  );
};

export default ColumnMapper; 