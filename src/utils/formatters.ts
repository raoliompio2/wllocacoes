/**
 * Formats a number as currency in BRL (Brazilian Real)
 * @param amount - The number to format
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

/**
 * Creates a slug from a string (URL friendly)
 * @param name - The string to convert to slug
 * @returns URL friendly slug
 */
export const createSlug = (name: string): string => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/--+/g, '-') // Evita hífens duplicados
    .trim();
};