/**
 * Formats a number as currency in BRL (Brazilian Real)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Sob consulta';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};