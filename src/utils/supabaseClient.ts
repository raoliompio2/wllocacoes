// Este arquivo re-exporta o necessário do arquivo supabaseConfig.ts
// e adiciona funções específicas para manter compatibilidade

import { supabase } from './supabaseConfig';

// Re-exportar o cliente Supabase
export { supabase };

// Função para verificar e renovar a sessão atual
export const refreshSession = async (): Promise<boolean> => {
  try {
    // Primeiro obter a sessão atual para ver se existe
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      // Tentar extrair tokens da URL hash, caso estejamos em uma redefinição de senha
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          return false;
        }
        
        if (data.session) {
          return true;
        }
      }
      
      return false;
    }
    
    // Se temos uma sessão, tentar renovar
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      return false;
    }
    
    if (data.session) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

// Função para limpar tokens de autenticação antigos
export const clearAuthCache = () => {
  try {
    // Limpar tokens antigos do localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase.auth') || key.includes('sb-'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao limpar cache de autenticação:', error);
    return false;
  }
};

// Função para testar a conexão
export const testConnection = async () => {
  try {
    console.log('🔄 Testando conexão com o Supabase...');
    
    // Teste simples: tentar operação de leitura
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Teste de conexão falhou:', error);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro não tratado ao testar conexão:', error);
    return false;
  }
};