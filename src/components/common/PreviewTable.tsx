import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography,
  Paper,
  CircularProgress,
  TextField,
  Button,
  Alert,
  AlertTitle,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import { Check, X, Save, AlertCircle, Wand2, FileSearch } from 'lucide-react';
import { 
  DataGrid, 
  GridColDef, 
  GridRowsProp, 
  GridCellParams,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarQuickFilter,
  GridRenderEditCellParams,
  GridCellEditStopReasons,
  useGridApiRef,
  GridRowSelectionModel,
  GridRowId
} from '@mui/x-data-grid';

interface PreviewTableProps {
  tableName: string;
  mappedData: any[];
  columnMapping: Record<string, string>;
  requiredFields?: string[];
  onDataProcessed?: (processedData: any[]) => void;
}

interface ValidationErrors {
  [rowId: string]: {
    [field: string]: string;
  };
}

interface ErrorSummary {
  type: string;
  count: number;
  description: string;
  fixable: boolean;
}

// Componente personalizado para a barra de ferramentas
function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}

const PreviewTable: React.FC<PreviewTableProps> = ({
  tableName,
  mappedData,
  columnMapping,
  requiredFields = [],
  onDataProcessed
}) => {
  const apiRef = useGridApiRef();
  const [loading, setLoading] = useState(false);
  const [editedData, setEditedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [pageSize, setPageSize] = useState<number>(10);
  const [errorSummary, setErrorSummary] = useState<ErrorSummary[]>([]);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set<GridRowId>()
  });
  const [fixInProgress, setFixInProgress] = useState(false);
  const [fixableRowsCount, setFixableRowsCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });

  // Converter os dados mapeados para o formato de linhas do DataGrid
  useEffect(() => {
    if (mappedData.length > 0) {
      const rowsWithIds = mappedData.map((item, index) => ({
        ...item,
        id: index.toString() // Adicionando um ID para o DataGrid
      }));
      setEditedData(rowsWithIds);
      validateAllData(rowsWithIds);
    }
  }, [mappedData]);

  // Função auxiliar para verificar se uma linha está selecionada
  const isRowSelected = (rowId: GridRowId): boolean => {
    if (selectionModel.type === 'include') {
      return selectionModel.ids.has(rowId);
    } else {
      return !selectionModel.ids.has(rowId);
    }
  };

  // Função auxiliar para obter todas as linhas selecionadas
  const getSelectedRows = (): GridRowId[] => {
    if (selectionModel.type === 'include') {
      return Array.from(selectionModel.ids);
    } else {
      return editedData
        .map(row => row.id)
        .filter(id => !selectionModel.ids.has(id));
    }
  };

  // Validar todos os dados
  const validateAllData = (data: any[]) => {
    const errors: ValidationErrors = {};
    const errorTypes: Record<string, number> = {};
    let fixableRows = 0;
    
    data.forEach((row, index) => {
      const rowId = index.toString();
      errors[rowId] = {};
      let hasFixableError = false;
      
      // Verificar campos obrigatórios
      requiredFields.forEach(field => {
        const mappedField = columnMapping[field];
        if (mappedField && (!row[mappedField] || row[mappedField].trim() === '')) {
          errors[rowId][field] = 'Campo obrigatório';
          errorTypes[`required_${field}`] = (errorTypes[`required_${field}`] || 0) + 1;
        }
      });
      
      // Validar campos de valores numéricos
      const rateFields = ['daily_rate', 'weekly_rate', 'monthly_rate'];
      rateFields.forEach(field => {
        const mappedField = columnMapping[field];
        if (mappedField && row[mappedField] !== undefined && row[mappedField] !== '') {
          const value = row[mappedField];
          
          // Tentar limpar o valor para verificar se é possível consertar
          const cleanedValue = value
            .replace(/[^\d.,]/g, '') // Remove tudo exceto números, pontos e vírgulas
            .replace(/,/g, '.') // Substitui vírgulas por pontos
            .replace(/(\..*?)\./g, '$1'); // Mantém apenas o primeiro ponto decimal
          
          if (isNaN(parseFloat(value))) {
            if (!isNaN(parseFloat(cleanedValue))) {
              // É possível corrigir
              errors[rowId][field] = `Valor numérico inválido (corrigível: ${cleanedValue})`;
              errorTypes[`fixable_number_${field}`] = (errorTypes[`fixable_number_${field}`] || 0) + 1;
              hasFixableError = true;
            } else {
              errors[rowId][field] = 'Valor numérico inválido';
              errorTypes[`invalid_number_${field}`] = (errorTypes[`invalid_number_${field}`] || 0) + 1;
            }
          }
        }
      });
      
      // Validar URLs de imagens
      const imageField = columnMapping.image;
      if (imageField && row[imageField]) {
        const value = row[imageField];
        
        // Regex melhorada para URLs
        const urlPattern = /^(https?:\/\/[^\s()<>"']+)/;
        
        if (!urlPattern.test(value)) {
          // Verificar se há URLs dentro da string que podem ser extraídas
          const urlMatches = value.match(/(https?:\/\/[^\s()<>"']+)/g);
          
          if (urlMatches && urlMatches.length > 0) {
            errors[rowId].image = `URL inválida (corrigível: ${urlMatches[0]})`;
            errorTypes['fixable_url'] = (errorTypes['fixable_url'] || 0) + 1;
            hasFixableError = true;
          } else {
            errors[rowId].image = 'URL inválida';
            errorTypes['invalid_url'] = (errorTypes['invalid_url'] || 0) + 1;
          }
        }
      }
      
      if (hasFixableError) {
        fixableRows++;
      }
    });
    
    setValidationErrors(errors);
    setFixableRowsCount(fixableRows);
    
    // Construir resumo de erros
    const summary: ErrorSummary[] = [];
    
    // Campos obrigatórios
    Object.keys(errorTypes)
      .filter(key => key.startsWith('required_'))
      .forEach(key => {
        const field = key.replace('required_', '');
        summary.push({
          type: 'required_field',
          count: errorTypes[key],
          description: `Campo "${field}" obrigatório não preenchido`,
          fixable: false
        });
      });
    
    // Valores numéricos inválidos
    Object.keys(errorTypes)
      .filter(key => key.startsWith('invalid_number_'))
      .forEach(key => {
        const field = key.replace('invalid_number_', '');
        summary.push({
          type: 'invalid_number',
          count: errorTypes[key],
          description: `Valor numérico inválido em "${field}"`,
          fixable: false
        });
      });
    
    // Valores numéricos corrigíveis
    Object.keys(errorTypes)
      .filter(key => key.startsWith('fixable_number_'))
      .forEach(key => {
        const field = key.replace('fixable_number_', '');
        summary.push({
          type: 'fixable_number',
          count: errorTypes[key],
          description: `Valor numérico corrigível em "${field}"`,
          fixable: true
        });
      });
    
    // URLs inválidas
    if (errorTypes['invalid_url']) {
      summary.push({
        type: 'invalid_url',
        count: errorTypes['invalid_url'],
        description: 'URL de imagem inválida',
        fixable: false
      });
    }
    
    // URLs corrigíveis
    if (errorTypes['fixable_url']) {
      summary.push({
        type: 'fixable_url',
        count: errorTypes['fixable_url'],
        description: 'URL de imagem corrigível',
        fixable: true
      });
    }
    
    setErrorSummary(summary);
  };

  // Construir as colunas da tabela
  const columns: GridColDef[] = useMemo(() => {
    if (mappedData.length === 0 || Object.keys(columnMapping).length === 0) {
      return [];
    }
    
    return Object.entries(columnMapping).map(([dbField, csvField]) => {
      const isRequired = requiredFields.includes(dbField);
      
      return {
        field: csvField,
        headerName: dbField,
        flex: 1,
        minWidth: 150,
        editable: true,
        headerClassName: isRequired ? 'required-column-header' : '',
        renderCell: (params: GridCellParams) => {
          const rowId = params.id.toString();
          const hasError = validationErrors[rowId] && validationErrors[rowId][dbField];
          const errorMessage = hasError ? validationErrors[rowId][dbField] : '';
          const isFixable = errorMessage.includes('corrigível');
          
          return (
            <Box sx={{ width: '100%', position: 'relative' }}>
              <Box
                component="span"
                sx={{
                  color: hasError ? 'error.main' : 'inherit',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {params.value === null || params.value === undefined ? '' : params.value.toString()}
              </Box>
              {hasError && (
                <Tooltip title={errorMessage}>
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: isFixable ? 'warning.main' : 'error.main',
                      display: 'flex'
                    }}
                  >
                    {isFixable ? <AlertCircle size={16} /> : <X size={16} />}
                  </Box>
                </Tooltip>
              )}
            </Box>
          );
        }
      };
    });
  }, [mappedData, columnMapping, requiredFields, validationErrors]);

  // Manipular a edição de células
  const handleCellEditStop = (params: any, event: any) => {
    if (params.reason === GridCellEditStopReasons.cellFocusOut) {
      const { id, field, value } = params;
      
      // Atualizar os dados
      setEditedData(prevData =>
        prevData.map(row => {
          if (row.id === id) {
            return { ...row, [field]: value };
          }
          return row;
        })
      );
      
      // Revalidar a linha específica
      validateRow(id.toString(), field, value);
    }
  };

  // Validar uma linha específica
  const validateRow = (rowId: string, field: string, value: any) => {
    const dbField = Object.entries(columnMapping).find(([_, csvField]) => csvField === field)?.[0];
    
    if (!dbField) return;
    
    const rowErrors = { ...(validationErrors[rowId] || {}) };
    
    // Verificar se é campo obrigatório
    if (requiredFields.includes(dbField) && (!value || value.trim() === '')) {
      rowErrors[dbField] = 'Campo obrigatório';
    } else {
      // Validações específicas por campo
      if (dbField === 'daily_rate' || dbField === 'weekly_rate' || dbField === 'monthly_rate') {
        if (isNaN(parseFloat(value))) {
          // Tentar limpar o valor
          const cleanedValue = value
            .replace(/[^\d.,]/g, '')
            .replace(/,/g, '.')
            .replace(/(\..*?)\./g, '$1');
          
          if (!isNaN(parseFloat(cleanedValue))) {
            rowErrors[dbField] = `Valor numérico inválido (corrigível: ${cleanedValue})`;
          } else {
            rowErrors[dbField] = 'Valor numérico inválido';
          }
        } else {
          delete rowErrors[dbField];
        }
      } else if (dbField === 'image') {
        const urlPattern = /^(https?:\/\/[^\s()<>"']+)/;
        
        if (value && !urlPattern.test(value)) {
          // Verificar se há URLs dentro da string
          const urlMatches = value.match(/(https?:\/\/[^\s()<>"']+)/g);
          
          if (urlMatches && urlMatches.length > 0) {
            rowErrors[dbField] = `URL inválida (corrigível: ${urlMatches[0]})`;
          } else {
            rowErrors[dbField] = 'URL inválida';
          }
        } else {
          delete rowErrors[dbField];
        }
      } else {
        delete rowErrors[dbField];
      }
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [rowId]: rowErrors
    }));
    
    // Revalidar todos os dados para atualizar o resumo
    validateAllData(editedData);
  };

  // Verificar se todos os dados são válidos
  const hasErrors = useMemo(() => {
    return Object.values(validationErrors).some(rowErrors => 
      Object.keys(rowErrors).length > 0
    );
  }, [validationErrors]);

  // Processar dados para a importação
  const processData = () => {
    setLoading(true);
    
    try {
      // Remover o campo ID adicionado para o DataGrid
      const processedData = editedData.map(({ id, ...item }) => item);
      
      // Chamar o callback com os dados processados
      onDataProcessed?.(processedData);
    } catch (error) {
      console.error('Erro ao processar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Corrigir automaticamente erros detectados
  const fixErrors = () => {
    setFixInProgress(true);
    
    const updatedData = [...editedData];
    const newValidationErrors = { ...validationErrors };
    
    // Processar todas as linhas ou apenas as selecionadas
    const selectedRowIds = getSelectedRows();
    const rowsToProcess = selectedRowIds.length > 0 
      ? selectedRowIds 
      : updatedData.map(row => row.id);
    
    rowsToProcess.forEach((rowId) => {
      const row = updatedData.find(r => r.id === rowId);
      if (!row) return;
      
      // Obter erros desta linha
      const rowErrors = validationErrors[String(rowId)] || {};
      
      // Corrigir cada erro
      Object.entries(rowErrors).forEach(([field, errorMessage]) => {
        // Pular erros não corrigíveis
        if (!errorMessage.includes('corrigível')) return;
        
        // Extrair o valor correto da mensagem de erro
        const match = errorMessage.match(/corrigível: (.+?)\)/);
        if (!match) return;
        
        const correctedValue = match[1];
        const csvField = columnMapping[field];
        
        if (!csvField) return;
        
        // Aplicar correção
        row[csvField] = correctedValue;
        
        // Remover o erro
        delete newValidationErrors[String(rowId)][field];
      });
    });
    
    // Atualizar dados e erros
    setEditedData(updatedData);
    setValidationErrors(newValidationErrors);
    
    // Revalidar para atualizar o resumo
    validateAllData(updatedData);
    setFixInProgress(false);
  };

  return (
    <div className="w-full">
      <Typography variant="h6" className="mb-3">
        Revisar Dados para Importação
      </Typography>
      
      <Paper elevation={2} className="p-4 mb-4">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <CircularProgress />
          </div>
        ) : (
          <>
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="body2">
                {editedData.length} registro(s) prontos para revisão.
                {hasErrors && 
                  ` Existem ${Object.values(validationErrors).reduce((total, rowErrors) => total + Object.keys(rowErrors).length, 0)} 
                  erros de validação em ${Object.values(validationErrors).filter(rowErrors => Object.keys(rowErrors).length > 0).length} registros.`}
                {fixableRowsCount > 0 && ` ${fixableRowsCount} registros possuem erros corrigíveis automaticamente.`}
              </Typography>
              
              <div className="flex gap-2">
                {fixableRowsCount > 0 && (
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<Wand2 />}
                    onClick={fixErrors}
                    disabled={fixInProgress}
                  >
                    Corrigir Erros Automaticamente
                  </Button>
                )}
                
                {errorSummary.length > 0 && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<FileSearch />}
                    onClick={() => setShowErrorDetails(true)}
                  >
                    Ver Detalhes dos Erros
                  </Button>
                )}
              </div>
            </Box>
            
            {hasErrors && (
              <Alert severity="warning" className="mb-4">
                <AlertTitle>Existem problemas nos dados</AlertTitle>
                <Typography variant="body2">
                  Alguns registros possuem erros de validação. 
                  Por favor, corrija os campos destacados antes de prosseguir.
                  {fixableRowsCount > 0 && ' Você pode usar a correção automática para alguns erros.'}
                </Typography>
              </Alert>
            )}
            
            <div style={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={editedData}
                columns={columns}
                apiRef={apiRef}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 20, 50, 100]}
                pagination
                checkboxSelection
                onRowSelectionModelChange={(newSelection) => {
                  if (typeof newSelection === 'object' && 'type' in newSelection) {
                    // Já está no formato correto v8
                    setSelectionModel(newSelection as GridRowSelectionModel);
                  } else {
                    // Converter o formato antigo para o novo
                    setSelectionModel({
                      type: 'include',
                      ids: new Set(Array.isArray(newSelection) ? newSelection : [])
                    });
                  }
                }}
                rowSelectionModel={selectionModel}
                onCellEditStop={handleCellEditStop}
                slots={{
                  toolbar: CustomToolbar,
                }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
                sx={{
                  '& .required-column-header': {
                    color: 'error.main',
                    '&::after': {
                      content: '" *"',
                      color: 'error.main',
                    },
                  },
                }}
              />
            </div>
            
            {/* Dialog para mostrar detalhes dos erros */}
            <Dialog 
              open={showErrorDetails} 
              onClose={() => setShowErrorDetails(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Detalhes dos Erros de Validação</DialogTitle>
              <DialogContent>
                <List>
                  {errorSummary.map((error, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {error.fixable ? <AlertCircle color="warning" /> : <X color="error" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={error.description} 
                        secondary={`${error.count} ocorrência${error.count > 1 ? 's' : ''}`}
                      />
                      <Chip 
                        label={error.fixable ? 'Corrigível' : 'Não Corrigível'} 
                        color={error.fixable ? 'warning' : 'error'} 
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
                
                {fixableRowsCount > 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <AlertTitle>Correção Automática Disponível</AlertTitle>
                    <Typography variant="body2">
                      Clique em "Corrigir Erros Automaticamente" para tentar corrigir os problemas marcados como corrigíveis.
                      A correção funcionará para:
                      <ul className="list-disc pl-5 mt-2">
                        <li>Valores numéricos com formato incorreto (vírgulas, R$, etc)</li>
                        <li>URLs de imagem incorretamente formatadas</li>
                      </ul>
                    </Typography>
                  </Alert>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowErrorDetails(false)}>Fechar</Button>
                {fixableRowsCount > 0 && (
                  <Button 
                    variant="contained" 
                    color="warning" 
                    startIcon={<Wand2 />} 
                    onClick={() => {
                      fixErrors();
                      setShowErrorDetails(false);
                    }}
                  >
                    Corrigir Erros Automaticamente
                  </Button>
                )}
              </DialogActions>
            </Dialog>
          </>
        )}
      </Paper>
      
      <div className="flex justify-end">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Save />}
          onClick={processData}
          disabled={loading || hasErrors || editedData.length === 0}
        >
          Confirmar e Prosseguir
        </Button>
      </div>
    </div>
  );
};

export default PreviewTable; 