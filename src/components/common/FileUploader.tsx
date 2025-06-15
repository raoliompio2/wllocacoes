import * as React from 'react';
import { useState, useCallback } from 'react';
import { Alert, AlertTitle, Button, CircularProgress, Typography, Box, LinearProgress } from '@mui/material';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FileUploaderProps {
  onFileLoaded: (data: any[], headers: string[]) => void;
  onError?: (error: Error) => void;
  acceptedFileTypes?: string;
  maxFileSize?: number; // em bytes
}

interface ProcessingLog {
  type: 'info' | 'warning' | 'error';
  message: string;
  count?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileLoaded,
  onError,
  acceptedFileTypes = '.csv,.xls,.xlsx',
  maxFileSize = 5 * 1024 * 1024, // 5MB por padrão
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [processingLogs, setProcessingLogs] = useState<ProcessingLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Função para adicionar logs de processamento
  const addLog = (type: 'info' | 'warning' | 'error', message: string, count?: number) => {
    const existingLogIndex = processingLogs.findIndex(log => log.message === message);
    
    if (existingLogIndex >= 0 && count) {
      // Atualizar contador para mensagens duplicadas
      const updatedLogs = [...processingLogs];
      updatedLogs[existingLogIndex] = {
        ...updatedLogs[existingLogIndex],
        count: (updatedLogs[existingLogIndex].count || 1) + 1
      };
      setProcessingLogs(updatedLogs);
    } else {
      // Adicionar nova mensagem
      setProcessingLogs(prev => [...prev, { type, message, count: count || 1 }]);
    }
  };

  // Função para sanitizar valores
  const sanitizeValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    
    // Converter para string
    const strValue = String(value);
    
    // Remover espaços extras
    const trimmed = strValue.trim();
    
    // Remover caracteres problemáticos
    const sanitized = trimmed
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Controle ASCII e Latin-1
      .replace(/\u2028|\u2029/g, ' '); // Separadores de linha Unicode
      
    return sanitized;
  };

  const parseCSV = (csvString: string) => {
    setProcessingLogs([]);
    setProcessingProgress(0);
    addLog('info', 'Iniciando processamento do arquivo CSV');
    
    const lines = csvString.split(/\r\n|\n/);
    if (lines.length === 0) {
      addLog('error', 'Arquivo CSV vazio');
      throw new Error('Arquivo CSV vazio');
    }

    addLog('info', `Total de ${lines.length} linhas encontradas`);
    
    // Assumimos que a primeira linha é o cabeçalho
    const headers = parseCSVLine(lines[0]);
    addLog('info', `${headers.length} colunas identificadas: ${headers.join(', ')}`);
    
    const data = [];
    let emptyLines = 0;
    let problematicLines = 0;

    // Processamos as linhas restantes
    for (let i = 1; i < lines.length; i++) {
      setProcessingProgress(Math.floor((i / lines.length) * 100));
      
      if (!lines[i].trim()) {
        emptyLines++;
        continue; // Ignorar linhas vazias
      }
      
      try {
        const values = parseCSVLine(lines[i]);
        
        // Criamos um objeto para cada linha usando os cabeçalhos como chaves
        const entry: Record<string, string> = {};
        let emptyValues = 0;
        
        for (let j = 0; j < headers.length; j++) {
          const rawValue = values[j] || '';
          const sanitizedValue = sanitizeValue(rawValue);
          
          if (!sanitizedValue) emptyValues++;
          
          entry[headers[j]] = sanitizedValue;
        }
        
        if (emptyValues === headers.length) {
          emptyLines++;
          continue; // Linha com todos os valores vazios
        }
        
        data.push(entry);
      } catch (err) {
        problematicLines++;
        addLog('warning', `Erro ao processar linha ${i}: ${(err as Error).message}`);
      }
    }

    if (emptyLines > 0) {
      addLog('info', `${emptyLines} linhas vazias foram ignoradas`);
    }
    
    if (problematicLines > 0) {
      addLog('warning', `${problematicLines} linhas com problemas de formatação foram ignoradas`);
    }
    
    addLog('info', `Processamento completo: ${data.length} registros válidos extraídos`);
    return { data, headers };
  };

  // Função auxiliar para analisar uma linha do CSV respeitando aspas
  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && line[i+1] === '"' && inQuotes) {
        // Caso de aspas escapadas: ""
        current += '"';
        i++;
        continue;
      }
      
      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      
      if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
        continue;
      }
      
      current += char;
    }
    
    // Não esquecer do último campo
    result.push(current);
    
    return result;
  };

  // Função para processar arquivos Excel (XLS/XLSX)
  const parseExcel = (arrayBuffer: ArrayBuffer) => {
    setProcessingLogs([]);
    setProcessingProgress(0);
    addLog('info', 'Iniciando processamento do arquivo Excel');
    
    // Ler o workbook
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    addLog('info', `Planilhas encontradas: ${workbook.SheetNames.join(', ')}`);
    
    // Assumimos que queremos a primeira planilha
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    addLog('info', `Processando planilha: ${firstSheetName}`);
    
    // Converter para JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length === 0) {
      addLog('error', 'Arquivo Excel vazio');
      throw new Error('Arquivo Excel vazio');
    }
    
    // Primeira linha como cabeçalhos
    const headers = jsonData[0] as string[];
    addLog('info', `${headers.length} colunas identificadas: ${headers.join(', ')}`);
    
    // Processar as linhas de dados
    const data = [];
    let emptyLines = 0;
    let problematicLines = 0;
    
    for (let i = 1; i < jsonData.length; i++) {
      setProcessingProgress(Math.floor((i / jsonData.length) * 100));
      
      const row = jsonData[i] as any[];
      
      if (!row || row.length === 0 || row.every(cell => !cell)) {
        emptyLines++;
        continue; // Pular linhas vazias
      }
      
      try {
        // Criamos um objeto para cada linha usando os cabeçalhos como chaves
        const entry: Record<string, string> = {};
        let emptyValues = 0;
        
        for (let j = 0; j < headers.length; j++) {
          const rawValue = row[j] !== undefined ? row[j] : '';
          const sanitizedValue = sanitizeValue(rawValue);
          
          if (!sanitizedValue) emptyValues++;
          
          entry[headers[j]] = sanitizedValue;
        }
        
        if (emptyValues === headers.length) {
          emptyLines++;
          continue; // Linha com todos os valores vazios
        }
        
        data.push(entry);
      } catch (err) {
        problematicLines++;
        addLog('warning', `Erro ao processar linha ${i}: ${(err as Error).message}`);
      }
    }
    
    if (emptyLines > 0) {
      addLog('info', `${emptyLines} linhas vazias foram ignoradas`);
    }
    
    if (problematicLines > 0) {
      addLog('warning', `${problematicLines} linhas com problemas de formatação foram ignoradas`);
    }
    
    addLog('info', `Processamento completo: ${data.length} registros válidos extraídos`);
    return { data, headers };
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    const file = e?.target?.files?.[0];
    if (!file) return;

    // Verificação de tipo de arquivo
    const isCSV = file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xls') || file.name.endsWith('.xlsx');
    
    if (!isCSV && !isExcel) {
      setError('Por favor, selecione um arquivo CSV ou Excel válido');
      return;
    }

    // Verificação de tamanho
    if (file.size > maxFileSize) {
      setError(`Arquivo muito grande. Tamanho máximo: ${maxFileSize / 1024 / 1024}MB`);
      return;
    }

    setFileName(file.name);
    setLoading(true);

    if (isCSV) {
      // Processar CSV
      const reader = new window.FileReader();
      
      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const csvString = event.target?.result as string;
          const { data, headers } = parseCSV(csvString);
          onFileLoaded(data, headers);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Erro ao processar o arquivo CSV');
          setError(error.message);
          onError?.(error);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Erro ao ler o arquivo');
        setLoading(false);
        onError?.(new Error('Erro ao ler o arquivo'));
      };

      reader.readAsText(file);
    } else {
      // Processar Excel
      const reader = new window.FileReader();
      
      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const { data, headers } = parseExcel(arrayBuffer);
          onFileLoaded(data, headers);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Erro ao processar o arquivo Excel');
          setError(error.message);
          onError?.(error);
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Erro ao ler o arquivo');
        setLoading(false);
        onError?.(new Error('Erro ao ler o arquivo'));
      };

      reader.readAsArrayBuffer(file);
    }
  }, [maxFileSize, onFileLoaded, onError]);

  return (
    <div className="w-full">
      {error && (
        <Alert severity="error" className="mb-4">
          <AlertTitle>Erro</AlertTitle>
          {error}
        </Alert>
      )}
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
        <input
          type="file"
          id="file-input"
          onChange={handleFileChange}
          accept={acceptedFileTypes}
          className="hidden"
          disabled={loading}
        />
        
        {loading ? (
          <div className="flex flex-col items-center">
            <CircularProgress size={32} />
            <Typography className="mt-2">Processando arquivo...</Typography>
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress variant="determinate" value={processingProgress} />
            </Box>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center">
            <FileText size={32} className="text-blue-500 mb-2" />
            <Typography className="mb-2">{fileName}</Typography>
            <div className="flex gap-2">
              <Button 
                variant="text" 
                color="primary"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                Escolher outro arquivo
              </Button>
              {processingLogs.length > 0 && (
                <Button
                  variant="text"
                  color="secondary"
                  startIcon={<AlertCircle size={16} />}
                  onClick={() => setShowLogs(!showLogs)}
                >
                  {showLogs ? 'Ocultar Logs' : 'Mostrar Logs'}
                </Button>
              )}
            </div>
            
            {showLogs && processingLogs.length > 0 && (
              <Box sx={{ mt: 2, width: '100%', textAlign: 'left', maxHeight: '200px', overflow: 'auto' }}>
                {processingLogs.map((log, idx) => (
                  <Box 
                    key={idx} 
                    sx={{ 
                      p: 1, 
                      mb: 0.5, 
                      fontSize: '0.8rem',
                      borderLeft: '3px solid',
                      borderColor: log.type === 'error' ? 'error.main' : log.type === 'warning' ? 'warning.main' : 'info.main',
                      bgcolor: 'background.paper'
                    }}
                  >
                    {log.message} {log.count && log.count > 1 ? `(${log.count}x)` : ''}
                  </Box>
                ))}
              </Box>
            )}
          </div>
        ) : (
          <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center">
            <Upload size={32} className="text-gray-400 mb-2" />
            <Typography className="mb-2">Clique ou arraste para selecionar um arquivo CSV ou Excel</Typography>
            <Button variant="contained" color="primary" component="span">
              Selecionar Arquivo
            </Button>
          </label>
        )}
      </div>
    </div>
  );
};

export default FileUploader; 