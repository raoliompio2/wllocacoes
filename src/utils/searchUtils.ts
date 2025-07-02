/**
 * Utilitários de busca avançada com suporte a pesquisa fuzzy
 * Este módulo fornece funções para busca tolerante a erros ortográficos e variações de escrita
 */

/**
 * Remove acentos e caracteres especiais do texto
 * @param text Texto para normalizar
 * @returns Texto normalizado sem acentos
 */
export const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

/**
 * Calcula a distância de Levenshtein entre duas strings
 * @param a Primeira string
 * @param b Segunda string
 * @returns Número de edições necessárias para transformar a em b
 */
export const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];
  
  // Inicializar a matriz
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Preencher a matriz
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i-1) === a.charAt(j-1)) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i-1][j-1] + 1, // substituição
          matrix[i][j-1] + 1,   // inserção
          matrix[i-1][j] + 1    // exclusão
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

/**
 * Calcula a similaridade entre duas strings (0 a 1)
 * @param a Primeira string
 * @param b Segunda string
 * @returns Valor entre 0 (totalmente diferente) e 1 (idêntico)
 */
export const stringSimilarity = (a: string, b: string): number => {
  if (!a || !b) return 0;
  if (a === b) return 1;
  
  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  return 1 - distance / maxLength;
};

/**
 * Implementação básica de stemming para português
 * Remove sufixos comuns para encontrar a raiz das palavras
 * @param word Palavra para fazer stemming
 * @returns Raiz da palavra
 */
export const stemWord = (word: string): string => {
  if (!word) return '';
  const normalized = normalizeText(word);
  
  // Lista de sufixos comuns em português
  const suffixes = [
    'inho', 'inha', 'zinho', 'zinha', 'amente', 
    'adores', 'ador', 'adora', 'eiros', 'eiro', 'eira',
    'mente', 'mento', 'mentos', 'ância', 'ância',
    'ções', 'ção', 'sões', 'são',
    'ada', 'adas', 'ado', 'ados', 'idos', 'ido', 'idas', 'ida',
    'eis', 'el', 'ores', 'or', 'oso', 'osa',
    'ando', 'endo', 'indo',
    'amos', 'emos', 'imos',
    'avam', 'ávamos', 'aremos', 'aríamos',
    'es', 's'
  ];
  
  let result = normalized;
  
  // Tentar remover cada sufixo
  for (const suffix of suffixes) {
    if (result.length > suffix.length + 3 && result.endsWith(suffix)) {
      result = result.slice(0, -suffix.length);
      break; // Remover apenas um sufixo por vez
    }
  }
  
  return result;
};

/**
 * Converte uma palavra para sua representação fonética aproximada em português
 * Implementação simplificada para o português brasileiro
 * @param word Palavra para converter
 * @returns Representação fonética da palavra
 */
export const phoneticCode = (word: string): string => {
  if (!word) return '';
  const normalized = normalizeText(word).toLowerCase();
  
  let phonetic = normalized
    // Substituições fonéticas comuns em português
    .replace(/[çc]([ei])/g, 's$1') // ç, ce, ci -> se, si
    .replace(/c([aou])/g, 'k$1')   // ca, co, cu -> ka, ko, ku
    .replace(/ch/g, 'x')           // ch -> x
    .replace(/ss/g, 's')           // ss -> s
    .replace(/[zs]$/g, 's')        // z, s no final -> s
    .replace(/[xsch]/g, 'x')       // x, sc, sh -> x
    .replace(/[vw]/g, 'v')         // v, w -> v
    .replace(/[nm]b/g, 'mb')       // nb -> mb
    .replace(/rr/g, 'r')           // rr -> r
    .replace(/[rl]$/g, 'r')        // r, l no final -> r
    .replace(/[tdp]h/g, 't')       // th, dh, ph -> t
    .replace(/y/g, 'i')            // y -> i
    .replace(/nh/g, 'n')           // nh -> n
    .replace(/lh/g, 'l')           // lh -> l
    .replace(/[aeiou]+/g, 'a')     // vogais -> a (simplificação)
    .replace(/[^a-z]/g, '');       // remover caracteres que não são letras
  
  return phonetic;
};

/**
 * Lista de correções para erros ortográficos comuns
 * Mapeia termos escritos incorretamente para suas formas corretas
 */
export const commonTypos: Record<string, string> = {
  // Equipamentos de construção
  'betorneira': 'betoneira',
  'betuneira': 'betoneira',
  'batuneira': 'betoneira',
  'andaine': 'andaime',
  'andames': 'andaimes',
  'andaimis': 'andaimes',
  'furaderia': 'furadeira',
  'martelete': 'martelete',
  'marteleti': 'martelete',
  'esmerilhaderia': 'esmerilhadeira',
  'esmerilhadera': 'esmerilhadeira',
  'compactador': 'compactador',
  'compaqtador': 'compactador',
  'marreta': 'marreta',
  'mareta': 'marreta',
  'parafuzadeira': 'parafusadeira',
  'parafuzadera': 'parafusadeira',
  'serrote': 'serrote',
  'serote': 'serrote',
  'politris': 'politriz',
  'politrix': 'politriz',
  'policorts': 'policorte',
  'plikort': 'policorte',
  'andaime tubular': 'andaime tubular',
  'andaime tubolar': 'andaime tubular',
  'comprensor': 'compressor',
  'compressor': 'compressor',
  'gerador': 'gerador',
  'jerador': 'gerador',
  'lixadeira': 'lixadeira',
  'lixadera': 'lixadeira',
  'plaina': 'plaina',
  'praina': 'plaina',
  'furadeira de impacto': 'furadeira de impacto',
  'furadeira de impato': 'furadeira de impacto',
  'serra circular': 'serra circular',
  'cerra circular': 'serra circular',
  'placa': 'placa',
  'praca': 'placa',
  'vibrador': 'vibrador',
  'fibrador': 'vibrador',
  'escora': 'escora',
  'iscora': 'escora',
  'escora metalica': 'escora metálica',
  'escora metálica': 'escora metálica'
};

/**
 * Verifica e corrige erros comuns de digitação em equipamentos de construção
 * @param term Termo de busca com possíveis erros
 * @returns Termo corrigido ou o próprio termo se não houver correção
 */
export const correctCommonTypos = (term: string): string => {
  if (!term) return '';
  const normalized = normalizeText(term).toLowerCase();
  
  // Verificar palavras exatas
  if (commonTypos[normalized]) {
    return commonTypos[normalized];
  }
  
  // Verificar cada palavra do termo
  const words = normalized.split(/\s+/);
  const correctedWords = words.map(word => commonTypos[word] || word);
  
  // Se alguma palavra foi corrigida, retorna o termo corrigido
  if (words.some((word, i) => word !== correctedWords[i])) {
    return correctedWords.join(' ');
  }
  
  return term;
};

/**
 * Verificar se um item corresponde ao termo de busca usando múltiplas estratégias
 * @param item Item para verificar
 * @param searchTerm Termo de busca
 * @param fields Campos do item onde buscar
 * @returns Se o item corresponde ao termo de busca
 */
export const fuzzySearch = <T extends Record<string, any>>(
  item: T, 
  searchTerm: string, 
  fields: (keyof T)[]
): boolean => {
  if (!searchTerm) return true;
  if (!item || !fields || fields.length === 0) return false;
  
  const normalizedTerm = normalizeText(searchTerm);
  const stemmedTerm = stemWord(normalizedTerm);
  const phoneticTerm = phoneticCode(normalizedTerm);
  const correctedTerm = correctCommonTypos(normalizedTerm);
  
  // Dividir em palavras para busca mais granular
  const termWords = normalizedTerm.split(/\s+/).filter(Boolean);
  const stemmedWords = termWords.map(stemWord);
  const phoneticWords = termWords.map(phoneticCode);
  
  // Verificar cada campo
  return fields.some(field => {
    const fieldValue = String(item[field] || '');
    const normalizedValue = normalizeText(fieldValue);
    const stemmedValue = stemWord(normalizedValue);
    const phoneticValue = phoneticCode(normalizedValue);
    
    // Correspondência exata
    if (normalizedValue.includes(normalizedTerm) || 
        normalizedValue.includes(correctedTerm)) {
      return true;
    }
    
    // Correspondência por stemming
    if (stemmedValue.includes(stemmedTerm)) {
      return true;
    }
    
    // Correspondência fonética
    if (phoneticValue.includes(phoneticTerm)) {
      return true;
    }
    
    // Verificar palavras individuais
    const valueWords = normalizedValue.split(/\s+/).filter(Boolean);
    
    // Se alguma palavra do termo de busca corresponde a alguma palavra do valor
    return termWords.some(termWord => {
      // Correspondência exata de palavra
      if (valueWords.some(valueWord => valueWord.includes(termWord))) {
        return true;
      }
      
      // Distância de Levenshtein
      // Para palavras curtas (até 4 letras), exigir correspondência exata
      if (termWord.length > 4) {
        const maxDistance = Math.floor(termWord.length / 4); // Tolerância proporcional ao tamanho
        if (valueWords.some(valueWord => 
          levenshteinDistance(termWord, valueWord) <= maxDistance)) {
          return true;
        }
      }
      
      // Verificar correspondência corrigida
      const correctedWord = correctCommonTypos(termWord);
      if (correctedWord !== termWord && 
          valueWords.some(valueWord => valueWord.includes(correctedWord))) {
        return true;
      }
      
      return false;
    });
  });
};

/**
 * Ordena os resultados por relevância em relação ao termo de busca
 * @param items Lista de itens
 * @param searchTerm Termo de busca
 * @param fields Campos para calcular relevância
 * @returns Lista ordenada por relevância
 */
export const sortByRelevance = <T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] => {
  if (!searchTerm || !items.length) return items;
  
  const normalizedTerm = normalizeText(searchTerm);
  const correctedTerm = correctCommonTypos(normalizedTerm);
  
  return [...items].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    
    // Calcular pontuação para cada item
    fields.forEach(field => {
      const valueA = normalizeText(String(a[field] || ''));
      const valueB = normalizeText(String(b[field] || ''));
      
      // Correspondência exata recebe pontuação maior
      if (valueA === normalizedTerm) scoreA += 100;
      if (valueB === normalizedTerm) scoreB += 100;
      
      // Começa com o termo
      if (valueA.startsWith(normalizedTerm)) scoreA += 50;
      if (valueB.startsWith(normalizedTerm)) scoreB += 50;
      
      // Contém o termo
      if (valueA.includes(normalizedTerm)) scoreA += 30;
      if (valueB.includes(normalizedTerm)) scoreB += 30;
      
      // Contém o termo corrigido
      if (correctedTerm !== normalizedTerm) {
        if (valueA.includes(correctedTerm)) scoreA += 25;
        if (valueB.includes(correctedTerm)) scoreB += 25;
      }
      
      // Adicionar similaridade como pontuação
      scoreA += stringSimilarity(valueA, normalizedTerm) * 20;
      scoreB += stringSimilarity(valueB, normalizedTerm) * 20;
    });
    
    // Ordenar por pontuação decrescente
    return scoreB - scoreA;
  });
}; 