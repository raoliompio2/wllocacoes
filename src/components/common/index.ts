// Importação e exportação dos componentes comuns
export { default as ResponsiveGrid, GridItem } from './ResponsiveGrid';
export { default as ResponsiveSection } from './ResponsiveSection';
export { default as ResponsiveCard } from './ResponsiveCard';
export { ResponsiveContainer } from '../Layout/DashboardLayout';

// Re-exportar outros componentes comuns existentes
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as FormField } from './FormField';
export { default as Card } from './Card';
export { default as Badge } from './Badge';
export { default as Alert } from './Alert';
export { default as SelectField } from './SelectField';
export { default as PriceField } from './PriceField';
export { default as ImageUploadField } from './ImageUploadField';
export { default as FileUploader } from './FileUploader';
export { default as ColumnMapper } from './ColumnMapper';
export { default as SQLGenerator } from './SQLGenerator';
export { default as ImageDownloader } from './ImageDownloader';

// Componentes de monitoramento e otimização
// LcpMonitor foi movido para ./LcpMonitor/index.ts - importar diretamente de lá
// ResponsiveImage foi movido para ./ResponsiveImage/index.ts - importar diretamente de lá
export { default as OptimizedImage } from './OptimizedImage';

// Novos componentes de importação CSV
export { default as PreviewTable } from './PreviewTable';
export { default as ImageProcessor } from './ImageProcessor';

// Componentes legados mantidos para compatibilidade
export { default as CSVReader } from './FileUploader'; // Compatibilidade com código anterior
export { default as FileReader } from './FileUploader'; // Compatibilidade com código anterior