/**
 * Utilitários para formatação de dados na aplicação
 */

/**
 * Formata um valor numérico para moeda brasileira (Real - R$)
 * @param value O valor a ser formatado
 * @returns String formatada como moeda
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return 'Sob consulta';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(value);
};

/**
 * Formata uma data para o formato brasileiro (dd/mm/aaaa)
 * @param dateString String de data para formatar
 * @returns Data formatada
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    return 'Data inválida';
  }
};

/**
 * Calcula a duração em dias entre duas datas
 * @param startDate Data de início
 * @param endDate Data de término
 * @returns Número de dias entre as datas
 */
export const calculateDurationInDays = (startDate: string, endDate: string): number => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
}; 