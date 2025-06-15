import * as React from 'react';
import { useState, useCallback } from 'react';
import { Alert, AlertTitle, Button, CircularProgress, Typography } from '@mui/material';
import { Upload, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FileReaderProps {
  onFileLoaded: (data: any[], headers: string[]) => void;
  onError?: (error: Error) => void;
  acceptedFileTypes?: string;
  maxFileSize?: number; // em bytes
}

const FileReader: React.FC<FileReaderProps> = ({
  onFileLoaded,
  onError,
  acceptedFileTypes = '.csv,.xls,.xlsx',
  maxFileSize = 5 * 1024 * 1024, // 5MB por padrão
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const parseCSV = (csvString: string) => {
    const lines = csvString.split(/\r\n|\n/);
    if (lines.length === 0) {
      throw new Error('Arquivo CSV vazio');
    }

    // Assumimos que a primeira linha é o cabeçalho
    const headers = parseCSVLine(lines[0]);
    const data = [];

    // Processamos as linhas restantes
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Ignorar linhas vazias
      
      const values = parseCSVLine(lines[i]);
      
      // Criamos um objeto para cada linha usando os cabeçalhos como chaves
      const entry: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        entry[headers[j]] = values[j] || '';
      }
      
      data.push(entry);
    }

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
    // Ler o workbook
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Assumimos que queremos a primeira planilha
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Converter para JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length === 0) {
      throw new Error('Arquivo Excel vazio');
    }
    
    // Primeira linha como cabeçalhos
    const headers = jsonData[0] as string[];
    
    // Processar as linhas de dados
    const data = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // Criamos um objeto para cada linha usando os cabeçalhos como chaves
      const entry: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        // Convertendo para string para garantir consistência com o formato CSV
        entry[headers[j]] = row[j] !== undefined ? String(row[j]) : '';
      }
      
      data.push(entry);
    }
    
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
      const reader = new FileReader();
      
      reader.onload = (event) => {
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
      const reader = new FileReader();
      
      reader.onload = (event) => {
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
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center">
            <FileText size={32} className="text-blue-500 mb-2" />
            <Typography className="mb-2">{fileName}</Typography>
            <Button 
              variant="text" 
              color="primary"
              onClick={() => document.getElementById('file-input')?.click()}
            >
              Escolher outro arquivo
            </Button>
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

export default FileReader; 