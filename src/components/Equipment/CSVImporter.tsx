import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Box,
  Typography, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  CircularProgress,
  LinearProgress,
  Checkbox,
  List,
  ListItem
} from '@mui/material';
import { 
  FileUploader, 
  ColumnMapper, 
  PreviewTable,
  ImageProcessor
} from '../common';
import { supabase } from '../../utils/supabaseClient';

// Define os campos do banco de dados que podem ser mapeados
const EQUIPMENT_DB_FIELDS = [
  { name: 'id', label: 'ID', required: true },
  { name: 'name', label: 'Nome', required: true },
  { name: 'category', label: 'Nome da Categoria (será convertido)', required: false },
  { name: 'image', label: 'URL da Imagem (se múltiplas URLs separadas por | forem fornecidas, apenas a primeira será usada)' },
  { name: 'description', label: 'Descrição' },
  { name: 'specifications', label: 'Especificações' },
  { name: 'daily_rate', label: 'Valor Diária' },
  { name: 'weekly_rate', label: 'Valor Semanal' },
  { name: 'monthly_rate', label: 'Valor Mensal' },
  { name: 'available', label: 'Disponível (preenchido automaticamente)', required: false },
  { name: 'user_id', label: 'ID do Usuário (preenchido automaticamente)', required: false },
  { name: 'created_at', label: 'Data de Criação' },
  { name: 'updated_at', label: 'Data de Atualização' },
  { name: 'average_rating', label: 'Avaliação Média' },
  { name: 'total_reviews', label: 'Total de Avaliações' },
  { name: 'construction_phase_id', label: 'Nome da Fase de Obra (será convertido)', required: false },
  { name: 'technical_specs', label: 'Especificações Técnicas' }
];

// Campos obrigatórios para validação
const REQUIRED_FIELDS = ['id', 'name'];

interface Category {
  id: string;
  name: string;
}

interface ConstructionPhase {
  id: string;
  name: string;
}

interface ImportStatus {
  totalRecords: number;
  processedRecords: number;
  successCount: number;
  errorCount: number;
  errors: Array<{ id: string, error: string }>;
}

interface ImportOptions {
  skipImageValidation: boolean;
  createMissingCategories: boolean;
  createMissingPhases: boolean;
}

interface CSVImporterProps {
  open: boolean;
  onClose: () => void;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [constructionPhases, setConstructionPhases] = useState<ConstructionPhase[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [categoryMappings, setCategoryMappings] = useState<Record<string, string>>({});
  const [phaseMappings, setPhaseMappings] = useState<Record<string, string>>({});
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [importInProgress, setImportInProgress] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string, storageUrl: string }>>([]);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    skipImageValidation: false,
    createMissingCategories: true,
    createMissingPhases: true
  });

  // Passos do assistente de importação (atualizados)
  const steps = ['Carregar CSV', 'Validação Prévia', 'Mapear Colunas', 'Revisar Dados', 'Processar Imagens', 'Importar Dados'];

  // Buscar o usuário atual e dados de referência
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingData(true);
        
        // Buscar usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user.id);
        }

        // Buscar categorias existentes
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name');
        
        if (categoriesError) throw categoriesError;
        if (categoriesData) {
          setCategories(categoriesData);
        }
        
        // Buscar fases de construção existentes
        const { data: phasesData, error: phasesError } = await supabase
          .from('construction_phases')
          .select('id, name');
        
        if (phasesError) throw phasesError;
        if (phasesData) {
          setConstructionPhases(phasesData);
        }
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
        setError('Erro ao carregar dados iniciais. Verifique o console para mais detalhes.');
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Manipuladores para cada etapa
  const handleFileLoaded = (data: any[], headers: string[]) => {
    setCsvData(data);
    setCsvHeaders(headers);
    setError(null);
    setValidationReport(validateCsvData(data, headers));
    setActiveStep(1); // Avançar para a etapa de validação prévia
  };

  const handleMappingComplete = (mapping: Record<string, string>) => {
    // Verificar e corrigir se o mapeamento tenta usar "category_id" em vez de "category"
    const correctedMapping = {...mapping};
    
    // Se o usuário mapeou para "category_id" em vez de "category"
    if (correctedMapping.category_id && !correctedMapping.category) {
      console.warn('Detectada tentativa de usar "category_id", corrigindo para "category"');
      correctedMapping.category = correctedMapping.category_id;
      delete correctedMapping.category_id;
    }
    
    // Verificar outros campos incorretos
    Object.keys(correctedMapping).forEach(key => {
      if (key.includes('category_id')) {
        console.warn(`Campo mapeado incorretamente: ${key}, verificando se pode ser corrigido`);
        // Tentar corrigir automaticamente se possível
        const correctedKey = key.replace('category_id', 'category');
        if (!correctedMapping[correctedKey]) {
          correctedMapping[correctedKey] = correctedMapping[key];
        }
        delete correctedMapping[key];
      }
    });
    
    // Atualizar o mapeamento com valores corrigidos
    setColumnMapping(correctedMapping);
    processReferenceData(correctedMapping);
  };

  const handleDataProcessed = (data: any[]) => {
    setProcessedData(data);
    // Se a opção de pular validação de imagens estiver ativada, pule direto para a etapa final
    if (importOptions.skipImageValidation) {
      setActiveStep(5); // Importar Dados
    } else {
      setActiveStep(4); // Processar Imagens
    }
  };

  const handleImageProcessingComplete = (results: any) => {
    // Armazenar as URLs das imagens processadas
    setUploadedImages(results.imageData);
    
    // Avançar para a etapa de importação final
    setActiveStep(5);
  };

  const handleNext = () => {
    if (activeStep === 0 && csvData.length === 0) {
      setError('Por favor, carregue um arquivo CSV válido primeiro.');
      return;
    }
    
    if (activeStep === steps.length - 1) {
      onClose();
      return;
    }
    
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleReset = () => {
    // Reiniciar o processo de importação
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMapping({});
    setProcessedData([]);
    setImportStatus(null);
    setActiveStep(0);
    setError(null);
  };

  // Processa as categorias e fases de obra do CSV e identifica novas categorias sem criar no banco
  const processReferenceData = async (mapping: Record<string, string>) => {
    try {
      setLoadingData(true);
      setError(null);
      
      // Processar categorias se mapeadas - garantindo que usamos o campo correto 'category'
      const categoryColumn = mapping.category;
      if (categoryColumn) {
        await identifyCategories(categoryColumn);
      }
      
      // Processar fases de obra se mapeadas
      const phaseColumn = mapping.construction_phase_id;
      if (phaseColumn) {
        await identifyConstructionPhases(phaseColumn);
      }
      
      setActiveStep(2); // Avança para o próximo passo (Revisar Dados)
    } catch (err) {
      console.error('Erro ao processar dados de referência:', err);
      setError('Erro ao processar dados de referência. Verifique o console para mais detalhes.');
    } finally {
      setLoadingData(false);
    }
  };
  
  // Identifica as categorias do CSV sem criar no banco
  const identifyCategories = async (categoryColumn: string) => {
    // Extrair nomes de categorias únicos do CSV
    const categoryNames = Array.from(
      new Set(csvData.map(row => String(row[categoryColumn] || '').trim()).filter(Boolean))
    );

    console.log("Nomes de categorias identificados no CSV:", categoryNames);
    console.log("Categorias existentes no banco:", categories);

    // Verificar quais categorias já existem
    const newCategoryMappings: Record<string, string> = {};
    const categoriesToCreate: string[] = [];
    
    // Primeiro, mapear categorias existentes
    categories.forEach(category => {
      if (categoryNames.includes(category.name)) {
        console.log(`Categoria existente encontrada: "${category.name}" com ID ${category.id}`);
        newCategoryMappings[category.name] = category.id;
      }
    });

    // Identificar categorias a serem criadas
    categoryNames.forEach(name => {
      if (!categories.some(cat => cat.name === name)) {
        console.log(`Nova categoria identificada: "${name}"`);
        categoriesToCreate.push(name);
        // Usar um marcador temporário para categorias a serem criadas
        newCategoryMappings[name] = `new:${name}`;
      }
    });

    console.log("Mapeamento de categorias inicial:", newCategoryMappings);
    setCategoryMappings(newCategoryMappings);
  };
  
  // Identifica as fases de construção do CSV sem criar no banco
  const identifyConstructionPhases = async (phaseColumn: string) => {
    // Extrair nomes de fases únicos do CSV
    const phaseNames = Array.from(
      new Set(csvData.map(row => String(row[phaseColumn] || '').trim()).filter(Boolean))
    );

    // Verificar quais fases já existem
    const newPhaseMappings: Record<string, string> = {};
    const phasesToCreate: string[] = [];
    
    // Primeiro, mapear fases existentes
    constructionPhases.forEach(phase => {
      if (phaseNames.includes(phase.name)) {
        newPhaseMappings[phase.name] = phase.id;
      }
    });

    // Identificar fases a serem criadas
    phaseNames.forEach(name => {
      if (!constructionPhases.some(phase => phase.name === name)) {
        phasesToCreate.push(name);
        // Usar um marcador temporário para fases a serem criadas
        newPhaseMappings[name] = `new:${name}`;
      }
    });

    setPhaseMappings(newPhaseMappings);
  };

  // Função para gerar um UUID válido (formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)
  const generateValidUUID = (): string => {
    // Implementação simples do RFC4122 v4 UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Função para sanitizar objetos e garantir compatibilidade com o banco
  const sanitizeEquipmentData = (item: Record<string, any>): Record<string, any> => {
    const cleanItem = {...item};
    
    // Garantir que não haja category_id e que category seja usado corretamente
    if ('category_id' in cleanItem) {
      if (!cleanItem.category) {
        cleanItem.category = cleanItem.category_id;
      }
      delete cleanItem.category_id;
    }
    
    // Garantir que outros campos estejam no formato correto
    if (cleanItem.id && typeof cleanItem.id === 'string') {
      cleanItem.id = cleanItem.id.trim();
    }
    
    // Processar campo de imagem para pegar apenas a primeira URL
    if (cleanItem.image && typeof cleanItem.image === 'string' && cleanItem.image.includes('|')) {
      const urls = cleanItem.image.split('|').map(url => url.trim()).filter(Boolean);
      if (urls.length > 0) {
        cleanItem.image = urls[0];
        console.log(`URL de imagem processada para ${cleanItem.id || 'item'}: usando apenas a primeira URL`);
      }
    }
    
    // Converter campos numéricos para número quando necessário
    ['daily_rate', 'weekly_rate', 'monthly_rate'].forEach(field => {
      if (field in cleanItem && typeof cleanItem[field] === 'string') {
        const value = cleanItem[field].replace(/[^\d.,]/g, '').replace(',', '.');
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          cleanItem[field] = numValue;
        }
      }
    });
    
    return cleanItem;
  };

  // Função para preparar os dados para importação
  const prepareDataForImport = () => {
    const preparedData = processedData.map((item) => {
      const mappedItem: Record<string, any> = {};
      
      // Mapear os campos conforme o mapeamento de colunas
      Object.entries(columnMapping).forEach(([dbField, csvField]) => {
        // Garantir que o campo ID não seja nulo
        if (dbField === 'id' && (!item[csvField] || item[csvField].trim() === '')) {
          // Gerar um UUID válido se estiver nulo
          mappedItem[dbField] = generateValidUUID();
        } else {
          mappedItem[dbField] = item[csvField];
        }
      });
      
      // Adicionar campos adicionais necessários
      mappedItem.user_id = currentUser || null;
      mappedItem.available = true; // Definir disponível por padrão
      
      // Se tivermos uma URL de imagem processada para este item, adicionar ao campo de imagem
      const equipmentId = mappedItem.id || '';
      const uploadedImage = uploadedImages.find(img => img.id === equipmentId)?.storageUrl;
      if (uploadedImage) {
        mappedItem.image = uploadedImage;
      }
      
      // Mapear categorias e fases de construção se existirem
      const categoryField = Object.entries(columnMapping).find(([dbField]) => dbField === 'category')?.[1];
      if (categoryField && categoryMappings[item[categoryField]]) {
        const categoryMapping = categoryMappings[item[categoryField]];
        
        // Log para diagnóstico
        console.log(`Mapeamento de categoria: ${item[categoryField]} -> ${categoryMapping}`);
        
        // Garantir que o campo correto seja usado (category e não category_id)
        mappedItem.category = categoryMapping;
        
        // Garantir que não haja category_id no objeto
        if ('category_id' in mappedItem) {
          delete mappedItem.category_id;
        }
      }
      
      const phaseField = Object.entries(columnMapping).find(([dbField]) => dbField === 'construction_phase_id')?.[1];
      if (phaseField && phaseMappings[item[phaseField]]) {
        const phaseMapping = phaseMappings[item[phaseField]];
        
        // Log para diagnóstico
        console.log(`Mapeamento de fase: ${item[phaseField]} -> ${phaseMapping}`);
        
        // Corrigir: Todas as fases mapeadas devem ser usadas, não apenas as que começam com 'existing:'
        mappedItem.construction_phase_id = phaseMapping;
      }
      
      // Aplicar sanitização final
      return sanitizeEquipmentData(mappedItem);
    });

    return preparedData;
  };

  // Importar dados para o banco
  const importDataToDatabase = async () => {
    try {
      // Primeiro verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Usuário não autenticado. Faça login antes de importar dados.');
        return;
      }
      
      console.log('✅ Usuário autenticado:', session.user.email || session.user.id);
      
      const dataToImport = prepareDataForImport();
      
      if (dataToImport.length === 0) {
        setError('Não há dados válidos para importar.');
        return;
      }
      
      setImportInProgress(true);
      setImportProgress(0);
      
      const status: ImportStatus = {
        totalRecords: dataToImport.length,
        processedRecords: 0,
        successCount: 0,
        errorCount: 0,
        errors: []
      };
      
      setImportStatus(status);
      
      // Primeiro criar novas categorias, se necessário
      console.log("Iniciando criação de categorias...");
      console.log("Categorias a criar:", Object.entries(categoryMappings).filter(([_, id]) => id.startsWith('new:')).map(([name]) => name));
      await createNewCategories();
      console.log("Categorias após criação:", categoryMappings);
      
      // Depois criar novas fases de construção, se necessário
      console.log("Iniciando criação de fases...");
      console.log("Fases a criar:", Object.entries(phaseMappings).filter(([_, id]) => id.startsWith('new:')).map(([name]) => name));
      await createNewConstructionPhases();
      console.log("Fases após criação:", phaseMappings);
      
      // Atualizar o progresso
      setImportProgress(10); // 10% após criar categorias e fases
      
      // Processar em lotes para melhor performance
      const batchSize = 5;
      const remainingProgress = 90; // 90% restantes para importação de equipamentos
      
      for (let i = 0; i < dataToImport.length; i += batchSize) {
        const batch = dataToImport.slice(i, i + batchSize);
        
        // Garantir que todos os registros tenham um ID UUID válido e remover campos não existentes
        const processedBatch = batch.map((item, index) => {
          // Criar um novo objeto limpo em vez de modificar o original
          const cleanItem: Record<string, any> = {};
          
          // Garantir que tenha ID válido no formato UUID
          if (!item.id || item.id.trim() === '') {
            cleanItem.id = generateValidUUID();
          } else if (!item.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            // Se o ID não estiver no formato UUID, gera um novo
            cleanItem.id = generateValidUUID();
          } else {
            cleanItem.id = item.id;
          }
          
          // Campos obrigatórios
          cleanItem.name = item.name || `Equipamento ${i + index + 1}`;
          cleanItem.user_id = currentUser;
          cleanItem.available = true;
          
          // Copiar um a um os campos pertinentes
          if (item.description) cleanItem.description = item.description;
          if (item.model) cleanItem.model = item.model;
          if (item.brand) cleanItem.brand = item.brand;
          if (item.daily_rate) cleanItem.daily_rate = item.daily_rate;
          if (item.weekly_rate) cleanItem.weekly_rate = item.weekly_rate;
          if (item.monthly_rate) cleanItem.monthly_rate = item.monthly_rate;
          if (item.image) cleanItem.image = item.image;
          if (item.technical_specs) cleanItem.technical_specs = item.technical_specs;
          
          // Campos de relacionamento - garantir que usem o nome correto
          if (item.category) {
            console.log(`Equipamento ${cleanItem.name} associado à categoria com ID: ${item.category}`);
            cleanItem.category = item.category;
          }
          
          if (item.construction_phase_id) {
            console.log(`Equipamento ${cleanItem.name} associado à fase ID: ${item.construction_phase_id}`);
            cleanItem.construction_phase_id = item.construction_phase_id;
          }
          
          // Garantir que não exista category_id
          if ('category_id' in cleanItem) {
            console.warn('Removendo campo category_id indesejado:', cleanItem.category_id);
            delete cleanItem.category_id;
          }
          
          // Aplicar sanitização final
          return sanitizeEquipmentData(cleanItem);
        });
        
        try {
          console.log('Inserindo lote (sem category_id):', processedBatch);
          
          // Não usar mais a propriedade supabaseKey que não existe
          const apiUrl = supabase.supabaseUrl;
          
          // Uma última verificação em todo o lote para garantir que não tenha category_id
          const finalBatch = processedBatch.map(item => {
            const cleanedItem = {...item};
            // Remover explicitamente qualquer campo category_id
            if ('category_id' in cleanedItem) {
              delete cleanedItem.category_id;
            }
            return cleanedItem;
          });
          
          // Log para diagnóstico final
          console.log('Batch final sanitizado:', finalBatch.map(item => {
            const {id, name, category} = item;
            return {id, name, category, has_category_id: 'category_id' in item};
          }));
          
          try {
            // ALTERNATIVA: Usar o cliente Supabase diretamente em vez de fetch
            console.log('Usando cliente supabase.from para a inserção (autenticação gerenciada automaticamente)');
            
            const { data, error } = await supabase
              .from('equipment')
              .insert(finalBatch);
              
            if (error) {
              console.error('Erro ao importar lote:', error);
              
              // Registrar erro para todos os registros do lote
              batch.forEach(item => {
                status.errorCount++;
                status.errors.push({
                  id: item.id || 'desconhecido',
                  error: error.message || 'Erro desconhecido'
                });
              });
            } else {
              // Registrar sucesso
              status.successCount += processedBatch.length;
            }
          } catch (err) {
            console.error('Erro ao processar lote:', err);
            
            // Registrar erro para todos os registros do lote
            batch.forEach(item => {
              status.errorCount++;
              status.errors.push({
                id: item.id || 'desconhecido',
                error: 'Erro desconhecido durante a importação'
              });
            });
          }
        } catch (err) {
          console.error('Erro ao processar lote:', err);
          
          // Registrar erro para todos os registros do lote
          batch.forEach(item => {
            status.errorCount++;
            status.errors.push({
              id: item.id || 'desconhecido',
              error: 'Erro desconhecido durante a importação'
            });
          });
        }
        
        // Atualizar status de processamento
        status.processedRecords += batch.length;
        setImportStatus({ ...status });
        
        // Atualizar progresso
        const currentProgress = 10 + Math.floor((status.processedRecords / status.totalRecords) * remainingProgress);
        setImportProgress(currentProgress);
      }
    } catch (err) {
      console.error('Erro durante o processo de importação:', err);
      setError('Ocorreu um erro durante a importação. Verifique o console para mais detalhes.');
    } finally {
      setImportInProgress(false);
    }
  };

  // Criar novas categorias no banco
  const createNewCategories = async () => {
    const categoriesToCreate = Object.entries(categoryMappings)
      .filter(([_, id]) => id.startsWith('new:'))
      .map(([name]) => name);
    
    if (categoriesToCreate.length === 0) {
      console.log("Nenhuma categoria para criar");
      return;
    }
    
    console.log(`${categoriesToCreate.length} categorias para criar:`, categoriesToCreate);
    
    const updatedMappings = { ...categoryMappings };
    
    for (const categoryName of categoriesToCreate) {
      try {
        // Gerar UUID válido para a categoria
        const categoryId = generateValidUUID();
        console.log(`Criando categoria "${categoryName}" com ID: ${categoryId}`);
        
        const { data, error } = await supabase
          .from('categories')
          .insert({ 
            id: categoryId,
            name: categoryName 
          })
          .select('id, name')
          .single();
        
        if (error) {
          console.error(`Erro ao criar categoria ${categoryName}:`, error);
          // Tenta inserir sem retornar o registro inserido como fallback
          const insertResult = await supabase
            .from('categories')
            .insert({ 
              id: categoryId,
              name: categoryName 
            });
            
          if (insertResult.error) {
            console.error(`Falha total ao criar categoria ${categoryName}:`, insertResult.error);
            continue;
          } else {
            console.log(`Categoria ${categoryName} inserida com sucesso (sem retorno de dados)`);
            // Atualizar o mapeamento com o ID gerado manualmente
            updatedMappings[categoryName] = categoryId;
            // Atualizar a lista de categorias
            setCategories(prev => [...prev, { id: categoryId, name: categoryName }]);
          }
        } else if (data) {
          console.log(`Categoria ${categoryName} criada com sucesso:`, data);
          // Atualizar o mapeamento com o ID real
          updatedMappings[categoryName] = data.id;
          // Atualizar a lista de categorias
          setCategories(prev => [...prev, data]);
        }
      } catch (err) {
        console.error(`Erro ao criar categoria ${categoryName}:`, err);
      }
    }
    
    console.log("Mapeamento de categorias atualizado:", updatedMappings);
    setCategoryMappings(updatedMappings);
  };
  
  // Criar novas fases de construção no banco
  const createNewConstructionPhases = async () => {
    const phasesToCreate = Object.entries(phaseMappings)
      .filter(([_, id]) => id.startsWith('new:'))
      .map(([name]) => name);
    
    if (phasesToCreate.length === 0) return;
    
    const updatedMappings = { ...phaseMappings };
    
    for (const phaseName of phasesToCreate) {
      try {
        // Gerar UUID válido para a fase
        const phaseId = generateValidUUID();
        
        const { data, error } = await supabase
          .from('construction_phases')
          .insert({ 
            id: phaseId,
            name: phaseName 
          })
          .select('id, name')
          .single();
        
        if (error) {
          console.error(`Erro ao criar fase de obra ${phaseName}:`, error);
          continue;
        }
        
        if (data) {
          // Atualizar o mapeamento com o ID real
          updatedMappings[phaseName] = data.id;
          // Atualizar a lista de fases
          setConstructionPhases(prev => [...prev, data]);
        }
      } catch (err) {
        console.error(`Erro ao criar fase de obra ${phaseName}:`, err);
      }
    }
    
    setPhaseMappings(updatedMappings);
  };

  // Função para validar os dados CSV antes do mapeamento
  const validateCsvData = (data: any[], headers: string[]) => {
    // Resultado da validação
    const result = {
      totalRecords: data.length,
      validRecords: 0,
      emptyRecords: 0,
      duplicateIds: 0,
      possibleIdColumns: [],
      possibleImageColumns: [],
      possibleNameColumns: [],
      uniqueValues: {},
      warnings: [],
      suggestions: []
    };
    
    // Contar registros vazios
    result.emptyRecords = data.filter(row => 
      Object.values(row).every(val => !val || String(val).trim() === '')
    ).length;
    
    result.validRecords = data.length - result.emptyRecords;
    
    // Analisar cada coluna para identificar possíveis mapeamentos
    headers.forEach(header => {
      // Contagem de valores únicos para identificar colunas com valores únicos (possíveis IDs)
      const values = data.map(row => row[header]).filter(Boolean);
      const uniqueValues = new Set(values);
      result.uniqueValues[header] = uniqueValues.size;
      
      // Verificar se é uma possível coluna de ID
      if (uniqueValues.size === values.length && values.length > 0) {
        result.possibleIdColumns.push({
          header,
          confidence: Math.min(1, values.length / data.length)
        });
      }
      
      // Verificar se é uma possível coluna de imagem
      const imagePatterns = [/https?:\/\//, /\.(jpg|jpeg|png|gif|webp)/i, /image|img|foto|picture/i];
      const imageMatches = data.filter(row => {
        const value = String(row[header] || '');
        return imagePatterns.some(pattern => pattern.test(value));
      }).length;
      
      if (imageMatches > 0) {
        result.possibleImageColumns.push({
          header,
          confidence: imageMatches / data.length,
          matches: imageMatches
        });
      }
      
      // Verificar se é uma possível coluna de nome
      const namePatterns = [/name|nome|título|title|equip/i];
      const nameMatches = namePatterns.some(pattern => pattern.test(header));
      
      if (nameMatches) {
        result.possibleNameColumns.push({
          header,
          confidence: 0.8 // Confiança baseada no nome da coluna
        });
      }
    });
    
    // Ordenar por confiança
    result.possibleIdColumns.sort((a, b) => b.confidence - a.confidence);
    result.possibleImageColumns.sort((a, b) => b.confidence - a.confidence);
    result.possibleNameColumns.sort((a, b) => b.confidence - a.confidence);
    
    // Verificar quantidade mínima de dados
    if (result.validRecords < 1) {
      result.warnings.push({
        severity: 'error',
        message: 'Nenhum registro válido encontrado no arquivo.'
      });
    }
    
    // Verificar colunas mínimas necessárias
    if (result.possibleIdColumns.length === 0) {
      result.warnings.push({
        severity: 'error',
        message: 'Não foi possível identificar uma coluna de ID única para os equipamentos.'
      });
    }
    
    if (result.possibleNameColumns.length === 0) {
      result.warnings.push({
        severity: 'warning',
        message: 'Não foi possível identificar uma coluna para o nome dos equipamentos.'
      });
    }
    
    // Verificar URLs de imagem
    if (result.possibleImageColumns.length === 0) {
      result.warnings.push({
        severity: 'warning',
        message: 'Não foram encontradas possíveis colunas com URLs de imagens.'
      });
      
      result.suggestions.push({
        message: 'Considere ativar a opção "Pular validação de imagens" se não precisar importar imagens.'
      });
    } else {
      const bestImageColumn = result.possibleImageColumns[0];
      if (bestImageColumn.matches < result.validRecords * 0.5) {
        result.warnings.push({
          severity: 'warning',
          message: `Apenas ${bestImageColumn.matches} de ${result.validRecords} registros parecem ter URLs de imagem válidas.`
        });
      }
    }
    
    return result;
  };

  // Atualizar opções de importação
  const handleOptionChange = (option: keyof ImportOptions, value: boolean) => {
    setImportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  // Renderiza o conteúdo específico de cada etapa
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <FileUploader 
            onFileLoaded={handleFileLoaded}
            onError={(err) => setError(err.message)}
          />
        );
      case 1:
        return (
          <Paper elevation={2} className="p-4 mb-4">
            <Typography variant="h6" className="mb-3">
              Validação Prévia dos Dados
            </Typography>
            
            {validationReport && (
              <>
                <Alert severity="info" className="mb-4">
                  <AlertTitle>Resumo dos Dados</AlertTitle>
                  <Typography variant="body2">
                    • Total de registros: {validationReport.totalRecords}<br />
                    • Registros válidos: {validationReport.validRecords}<br />
                    • Registros vazios: {validationReport.emptyRecords}
                  </Typography>
                </Alert>
                
                {validationReport.warnings.length > 0 && (
                  <Box className="mb-4 space-y-2">
                    {validationReport.warnings.map((warning: any, idx: number) => (
                      <Alert key={idx} severity={warning.severity}>
                        <Typography variant="body2">{warning.message}</Typography>
                      </Alert>
                    ))}
                  </Box>
                )}
                
                {validationReport.possibleIdColumns.length > 0 && (
                  <Box className="mb-4">
                    <Typography variant="subtitle2" className="mb-1">
                      Possíveis colunas de ID detectadas:
                    </Typography>
                    <Box className="pl-4">
                      {validationReport.possibleIdColumns.map((col: any, idx: number) => (
                        <Typography key={idx} variant="body2">
                          • {col.header} (confiança: {Math.round(col.confidence * 100)}%)
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
                
                {validationReport.possibleNameColumns.length > 0 && (
                  <Box className="mb-4">
                    <Typography variant="subtitle2" className="mb-1">
                      Possíveis colunas de nome detectadas:
                    </Typography>
                    <Box className="pl-4">
                      {validationReport.possibleNameColumns.map((col: any, idx: number) => (
                        <Typography key={idx} variant="body2">
                          • {col.header}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
                
                {validationReport.possibleImageColumns.length > 0 && (
                  <Box className="mb-4">
                    <Typography variant="subtitle2" className="mb-1">
                      Possíveis colunas de imagem detectadas:
                    </Typography>
                    <Box className="pl-4">
                      {validationReport.possibleImageColumns.map((col: any, idx: number) => (
                        <Typography key={idx} variant="body2">
                          • {col.header} ({col.matches} URLs encontradas)
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
                
                <Box className="mb-4 border p-3 rounded-md">
                  <Typography variant="subtitle2" className="mb-2">
                    Opções de Importação
                  </Typography>
                  
                  <Box className="space-y-2">
                    <Box className="flex items-center">
                      <Checkbox
                        checked={importOptions.skipImageValidation}
                        onChange={(e) => handleOptionChange('skipImageValidation', e.target.checked)}
                      />
                      <Typography variant="body2">
                        Pular validação de imagens
                        <Typography variant="caption" className="block text-gray-500">
                          Ative esta opção se não precisar processar imagens ou se fará isso manualmente depois.
                        </Typography>
                      </Typography>
                    </Box>
                    
                    <Box className="flex items-center">
                      <Checkbox
                        checked={importOptions.createMissingCategories}
                        onChange={(e) => handleOptionChange('createMissingCategories', e.target.checked)}
                      />
                      <Typography variant="body2">
                        Criar categorias ausentes automaticamente
                        <Typography variant="caption" className="block text-gray-500">
                          Ative para criar novas categorias encontradas nos dados.
                        </Typography>
                      </Typography>
                    </Box>
                    
                    <Box className="flex items-center">
                      <Checkbox
                        checked={importOptions.createMissingPhases}
                        onChange={(e) => handleOptionChange('createMissingPhases', e.target.checked)}
                      />
                      <Typography variant="body2">
                        Criar fases de obra ausentes automaticamente
                        <Typography variant="caption" className="block text-gray-500">
                          Ative para criar novas fases de obra encontradas nos dados.
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                {validationReport.warnings.some((w: any) => w.severity === 'error') ? (
                  <Alert severity="error">
                    <AlertTitle>Não é possível continuar</AlertTitle>
                    <Typography variant="body2">
                      Existem erros críticos que impedem o prosseguimento da importação.
                      Por favor, corrija os problemas no arquivo CSV e tente novamente.
                    </Typography>
                  </Alert>
                ) : (
                  <Alert severity="success">
                    <AlertTitle>Dados validados com sucesso</AlertTitle>
                    <Typography variant="body2">
                      Os dados foram validados e estão prontos para serem mapeados.
                      Clique em "Continuar" para prosseguir com o mapeamento de colunas.
                    </Typography>
                  </Alert>
                )}
              </>
            )}
          </Paper>
        );
      case 2:
        return (
          <>
            <Alert severity="info" className="mb-4">
              <AlertTitle>Campos Automáticos e Conversões</AlertTitle>
              <p>Os seguintes campos serão processados automaticamente:</p>
              <ul className="list-disc pl-5 mt-2">
                <li><strong>Nome da Categoria:</strong> Será convertido para o ID correspondente {importOptions.createMissingCategories ? '(categorias novas serão criadas se necessário)' : '(apenas categorias existentes serão usadas)'}</li>
                <li><strong>Nome da Fase de Obra:</strong> Será convertido para o ID correspondente {importOptions.createMissingPhases ? '(fases novas serão criadas se necessário)' : '(apenas fases existentes serão usadas)'}</li>
                <li><strong>ID do Usuário:</strong> Será preenchido com seu ID ({currentUser || 'carregando...'})</li>
                <li><strong>Disponível:</strong> Será definido como "sim" para todos os equipamentos</li>
              </ul>
            </Alert>
            
            <ColumnMapper
              csvHeaders={csvHeaders}
              databaseFields={EQUIPMENT_DB_FIELDS}
              onMappingComplete={handleMappingComplete}
              initialMapping={columnMapping}
              suggestedMappings={{
                id: validationReport?.possibleIdColumns[0]?.header,
                name: validationReport?.possibleNameColumns[0]?.header,
                image: validationReport?.possibleImageColumns[0]?.header,
              }}
            />
          </>
        );
      case 3:
        // Se estiver carregando dados, mostrar indicador
        if (loadingData) {
          return (
            <div className="flex flex-col items-center p-8">
              <CircularProgress size={40} />
              <Typography className="mt-4">
                Processando dados de referência...
              </Typography>
            </div>
          );
        }

        // Contar novas categorias e fases
        const newCategories = Object.values(categoryMappings).filter(id => id.startsWith('new:')).length;
        const newPhases = Object.values(phaseMappings).filter(id => id.startsWith('new:')).length;

        // Adiciona campos automáticos ao mapeamento para a tabela de previsualização
        return (
          <>
            <div className="mb-4 space-y-2">
              {Object.keys(categoryMappings).length > 0 && (
                <Alert severity="info" className="mb-2">
                  <AlertTitle>Categorias Identificadas</AlertTitle>
                  <p>
                    {Object.keys(categoryMappings).length} {Object.keys(categoryMappings).length === 1 ? 'categoria foi identificada' : 'categorias foram identificadas'}.
                    {newCategories > 0 && 
                      ` ${newCategories} ${newCategories === 1 ? 'nova categoria será criada' : 'novas categorias serão criadas'} durante a importação.`}
                  </p>
                </Alert>
              )}
              
              {Object.keys(phaseMappings).length > 0 && (
                <Alert severity="info" className="mb-2">
                  <AlertTitle>Fases de Obra Identificadas</AlertTitle>
                  <p>
                    {Object.keys(phaseMappings).length} {Object.keys(phaseMappings).length === 1 ? 'fase de obra foi identificada' : 'fases de obra foram identificadas'}.
                    {newPhases > 0 && 
                      ` ${newPhases} ${newPhases === 1 ? 'nova fase será criada' : 'novas fases serão criadas'} durante a importação.`}
                  </p>
                </Alert>
              )}
            </div>
            
            <PreviewTable
              tableName="equipment"
              mappedData={csvData}
              columnMapping={columnMapping}
              requiredFields={REQUIRED_FIELDS}
              onDataProcessed={handleDataProcessed}
            />
          </>
        );
      case 4:
        const imageUrlColumn = Object.entries(columnMapping).find(([dbField]) => dbField === 'image')?.[1];
        const idColumn = Object.entries(columnMapping).find(([dbField]) => dbField === 'id')?.[1];
        
        if (!imageUrlColumn || !idColumn) {
          return (
            <Alert severity="warning">
              <AlertTitle>Mapeamento Incompleto</AlertTitle>
              Não foi possível identificar as colunas de ID e imagem no mapeamento.
              Por favor, volte à etapa de mapeamento e certifique-se de mapear esses campos.
            </Alert>
          );
        }
        
        return (
          <>
            <Alert severity="info" className="mb-4">
              <AlertTitle>Integração com WordPress</AlertTitle>
              <Typography variant="body2">
                O sistema agora utiliza a API REST do WordPress para obter URLs diretas das imagens de seusite.com.br, 
                eliminando problemas de CORS. Ainda há suporte para proxies e uploads manuais como alternativas.
              </Typography>
            </Alert>
            
            <ImageProcessor
              data={processedData}
              imageUrlColumn={imageUrlColumn}
              equipmentIdColumn={idColumn}
              onComplete={handleImageProcessingComplete}
            />
          </>
        );
      case 5:
        return (
          <div className="w-full">
            <Typography variant="h6" className="mb-3">
              Importação para o Banco de Dados
            </Typography>
            
            <Paper elevation={2} className="p-4 mb-4">
              {importStatus ? (
                <>
                  {importInProgress ? (
                    <Box sx={{ width: '100%', mb: 3 }}>
                      <Typography variant="body2" className="mb-1">
                        Importando dados ({importProgress}%)
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={importProgress} 
                      />
                      <Typography variant="caption" color="text.secondary" className="mt-2">
                        Processados {importStatus.processedRecords} de {importStatus.totalRecords} registros
                      </Typography>
                    </Box>
                  ) : (
                    <Alert 
                      severity={importStatus.errorCount === 0 ? "success" : "warning"} 
                      className="mb-4"
                    >
                      <AlertTitle>
                        {importStatus.errorCount === 0 
                          ? "Importação Concluída com Sucesso" 
                          : "Importação Concluída com Avisos"}
                      </AlertTitle>
                      <Typography variant="body2">
                        {importStatus.successCount} de {importStatus.totalRecords} registros foram importados com sucesso.
                        {importStatus.errorCount > 0 && 
                          ` ${importStatus.errorCount} registros apresentaram erro durante a importação.`}
                      </Typography>
                    </Alert>
                  )}
                  
                  {importStatus.errors.length > 0 && (
                    <Box className="mt-4">
                      <Typography variant="subtitle2" className="mb-2">
                        Erros de Importação:
                      </Typography>
                      <Paper variant="outlined" className="p-2 max-h-60 overflow-y-auto">
                        <List dense disablePadding>
                          {importStatus.errors.map((err, index) => (
                            <ListItem key={index} divider={index < importStatus.errors.length - 1}>
                              <Typography variant="body2">
                                <strong>ID {err.id}:</strong> {err.error}
                              </Typography>
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <Alert severity="info" className="mb-4">
                    <AlertTitle>Resumo da Importação</AlertTitle>
                    <Typography variant="body2">
                      • {processedData.length} equipamentos prontos para importação<br />
                      {uploadedImages.length > 0 && `• ${uploadedImages.length} imagens processadas e prontas para vinculação`}<br />
                      {Object.keys(categoryMappings).filter(key => categoryMappings[key].startsWith('new:')).length > 0 &&
                        `• ${Object.keys(categoryMappings).filter(key => categoryMappings[key].startsWith('new:')).length} novas categorias serão criadas`}<br />
                      {Object.keys(phaseMappings).filter(key => phaseMappings[key].startsWith('new:')).length > 0 &&
                        `• ${Object.keys(phaseMappings).filter(key => phaseMappings[key].startsWith('new:')).length} novas fases de obra serão criadas`}
                    </Typography>
                  </Alert>
                  
                  <Typography variant="body2" className="mb-4">
                    Clique em "Iniciar Importação" para começar o processo de importação para o banco de dados.
                    Este processo pode levar alguns minutos dependendo da quantidade de dados.
                  </Typography>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={importDataToDatabase}
                      disabled={processedData.length === 0}
                    >
                      Iniciar Importação
                    </Button>
                  </div>
                </>
              )}
            </Paper>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={() => activeStep === steps.length - 1 ? onClose() : null}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Assistente de Importação de Equipamentos
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" className="mb-4">
            <AlertTitle>Erro</AlertTitle>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} className="mb-8 pt-4">
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {renderStepContent()}
      </DialogContent>
      
      <DialogActions>
        <Button
          onClick={handleReset}
          disabled={activeStep === 0 || importInProgress}
        >
          Reiniciar
        </Button>
        
        {activeStep === 0 ? (
          <Button onClick={onClose}>
            Cancelar
          </Button>
        ) : (
          <Button 
            onClick={handleBack}
            disabled={activeStep === 0 || importInProgress}
          >
            Voltar
          </Button>
        )}
        
        {activeStep < steps.length - 1 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && csvData.length === 0) ||
              (activeStep === 1 && validationReport?.warnings.some((w: any) => w.severity === 'error')) ||
              importInProgress
            }
          >
            {activeStep === steps.length - 2 ? 'Finalizar' : 'Continuar'}
          </Button>
        )}
        
        {activeStep === steps.length - 1 && importStatus && importStatus.processedRecords === importStatus.totalRecords && (
          <Button
            variant="contained"
            color="primary"
            onClick={onClose}
          >
            Concluir
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CSVImporter; 