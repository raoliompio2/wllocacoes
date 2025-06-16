import { createClient, Session } from '@supabase/supabase-js';
import { Database } from './database.types';

// Configurações do Supabase usando variáveis de ambiente
export const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://fwsqvutgtwjyjbukydsy.supabase.co';
export const supabaseAnonKey = import.meta.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3c3F2dXRndHdqeWpidWt5ZHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTczNjgsImV4cCI6MjA2NTU5MzM2OH0.JUtKdyPA7Eh8N_mUe73yPMhehaQzkjFOA6EqD5HG9Ko';

// Log para debug
console.log('Inicializando Supabase com URL:', supabaseUrl);
console.log('Chave API:', supabaseAnonKey.substring(0, 15) + '...');

// Inicializar o cliente Supabase com configuração simplificada
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Função para verificar se há uma sessão válida
export const hasValidSession = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    return false;
  }
};

// Função para definir uma sessão a partir dos parâmetros na URL
export const setSessionFromUrl = async (): Promise<Session | null> => {
  try {
    // Verificar se há tokens no hash da URL
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          return null;
        }
        
        if (data.session) {
          return data.session;
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}; 