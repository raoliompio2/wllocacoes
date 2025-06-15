import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, CircularProgress } from '@mui/material';
import { Download, Copy, Check } from 'lucide-react';

interface SQLGeneratorProps {
  tableName: string;
  mappedData: any[];
  columnMapping: Record<string, string>;
  onSQLGenerated?: (sql: string) => void;
}

const SQLGenerator: React.FC<SQLGeneratorProps> = ({
  tableName,
  mappedData,
  columnMapping,
  onSQLGenerated,
}) => {
  const [sql, setSql] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (mappedData.length > 0 && Object.keys(columnMapping).length > 0) {
      generateSQL();
    }
  }, [mappedData, columnMapping]);

  const generateSQL = async () => {
    setLoading(true);
    
    try {
      // Monta colunas a partir do mapeamento
      const columns = Object.keys(columnMapping).filter(dbField => mappedData[0][columnMapping[dbField]] !== undefined);
      
      // Gera instruções SQL INSERT para cada linha de dados
      let sqlString = '';
      
      mappedData.forEach((row, index) => {
        // Prepara valores para cada coluna
        const values = columns.map(column => {
          const csvColumn = columnMapping[column];
          const value = row[csvColumn];
          
          // Verifica se o valor é nulo ou vazio
          if (value === undefined || value === null || value === '') {
            return 'null';
          }
          
          // Escapa aspas simples dentro de strings
          if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`;
          }
          
          return value;
        });
        
        // Constrói a instrução INSERT
        const insertStatement = `INSERT INTO "public"."${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
        sqlString += insertStatement;
      });
      
      setSql(sqlString);
      onSQLGenerated?.(sqlString);
    } catch (error) {
      console.error('Erro ao gerar SQL:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_rows.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <Typography variant="h6" className="mb-3">
        Código SQL Gerado
      </Typography>
      
      <Paper elevation={2} className="p-4 mb-4">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <CircularProgress />
          </div>
        ) : sql ? (
          <>
            <Box className="mb-4 flex justify-between">
              <Typography variant="body2">
                {mappedData.length} registro(s) convertido(s) em instruções SQL
              </Typography>
              <div className="space-x-2">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={copied ? <Check /> : <Copy />}
                  onClick={handleCopyToClipboard}
                >
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<Download />}
                  onClick={handleDownload}
                >
                  Download
                </Button>
              </div>
            </Box>
            
            <TextField
              multiline
              fullWidth
              value={sql}
              variant="outlined"
              InputProps={{
                readOnly: true,
                style: { 
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  maxHeight: '400px',
                  overflow: 'auto'
                }
              }}
            />
          </>
        ) : (
          <Typography color="text.secondary" className="p-4 text-center">
            Nenhum SQL gerado ainda. Configure o mapeamento de colunas e clique em Gerar SQL.
          </Typography>
        )}
      </Paper>
      
      {!sql && !loading && (
        <div className="flex justify-end">
          <Button
            variant="contained"
            color="primary"
            onClick={generateSQL}
            disabled={mappedData.length === 0 || Object.keys(columnMapping).length === 0}
          >
            Gerar SQL
          </Button>
        </div>
      )}
    </div>
  );
};

export default SQLGenerator; 