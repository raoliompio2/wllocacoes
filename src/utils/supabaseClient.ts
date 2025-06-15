import { createClient, Session } from '@supabase/supabase-js';
import { Database } from './database.types';

// Forçar o URL correto do ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fwsqvutgtwjyjbukydsy.supabase.co';
// Usar a chave do ambiente ou a chave hardcoded como fallback, garantindo que seja uma chave válida
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3c3F2dXRndHdqeWpidWt5ZHN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk5MDg3NTgsImV4cCI6MjAyNTQ4NDc1OH0.WDEkGHoTiDYo_QoYHPgfQ0eTJLKMSWh4-_Qj-QRgRSY';

// Debug aprimorado para verificar credenciais
console.log('🔄 Inicializando cliente Supabase:');
console.log(`📡 URL: ${supabaseUrl}`);
console.log(`🔑 API Key: ${supabaseAnonKey.substring(0, 15)}...`);

// Verificar se as credenciais estão definidas
if (!supabaseUrl) {
  console.error('❌ Erro crítico: URL do Supabase não definida');
  throw new Error('Missing Supabase URL. Please check your configuration.');
}

if (!supabaseAnonKey) {
  console.error('❌ Erro crítico: ANON Key do Supabase não definida');
  throw new Error('Missing Supabase ANON Key. Please check your configuration.');
}

// Validar formato da URL
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('❌ Erro crítico: Formato de URL do Supabase inválido');
  throw new Error('Invalid Supabase URL format. Please check your URL.');
}

// Validar formato do JWT token (verificação básica)
if (!supabaseAnonKey.includes('.') || supabaseAnonKey.split('.').length !== 3) {
  console.warn('⚠️ Alerta: A chave de API não parece ser um JWT válido (deve ter formato xxx.yyy.zzz)');
}

// Inicializar o cliente Supabase com opções adicionais
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'panda-loc-auth-storage',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  },
  // Adicionar configurações para melhorar a estabilidade da conexão
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Função para limpar tokens de autenticação antigos que podem causar conflitos
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
      console.log(`Removendo chave antiga de autenticação: ${key}`);
      localStorage.removeItem(key);
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao limpar cache de autenticação:', error);
    return false;
  }
};

// Função para verificar e renovar a sessão atual
export const refreshSession = async (): Promise<boolean> => {
  try {
    console.log('Tentando renovar sessão...');
    
    // Primeiro obter a sessão atual para ver se existe
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      console.log('Nenhuma sessão ativa para renovar');
      
      // Tentar extrair tokens da URL hash, caso estejamos em uma redefinição de senha
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log('Encontrados tokens na URL, tentando estabelecer sessão');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          console.error('Erro ao definir sessão a partir de tokens na URL:', error);
          return false;
        }
        
        if (data.session) {
          console.log('Sessão estabelecida com sucesso a partir de tokens na URL');
          return true;
        }
      }
      
      return false;
    }
    
    // Se temos uma sessão, tentar renovar
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.warn('Erro ao renovar sessão:', error);
      return false;
    }
    
    if (data.session) {
      console.log('Sessão renovada com sucesso');
      return true;
    } else {
      console.log('Falha ao renovar sessão - nenhuma nova sessão retornada');
      return false;
    }
  } catch (error) {
    console.error('Erro não tratado ao renovar sessão:', error);
    return false;
  }
};

// Função para verificar se há uma sessão válida
export const hasValidSession = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
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
        console.log('Encontrados tokens na URL, tentando estabelecer sessão');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          console.error('Erro ao definir sessão a partir de tokens na URL:', error);
          return null;
        }
        
        if (data.session) {
          console.log('Sessão estabelecida com sucesso a partir de tokens na URL');
          return data.session;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao tentar definir sessão a partir da URL:', error);
    return null;
  }
};

// Tornar a chave acessível para debug
const apiKey = supabaseAnonKey; // Apenas para uso em debug e acesso interno

// Testar conexão - Versão aprimorada
export const testConnection = async () => {
  try {
    console.log('🔄 Testando conexão com o Supabase...');
    
    // Primeiro teste: tentar operação de leitura
    const { data: readData, error: readError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (readError) {
      console.error('❌ Teste de leitura falhou:', readError);
      
      // Se for erro de autenticação, tente obter o token da sessão atual
      if (readError.code === '401') {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔑 Sessão atual:', session ? 'Ativa' : 'Nenhuma');
        
        if (session) {
          console.log('👤 Usuário autenticado:', session.user.email);
          // Verifica se expires_at está definido antes de usá-lo
          if (session.expires_at) {
            console.log('⏱️ Token expira em:', new Date(session.expires_at * 1000).toLocaleString());
          } else {
            console.log('⏱️ Token sem data de expiração definida');
          }
        }
      }
      
      return false;
    }
    
    console.log('✅ Teste de leitura bem-sucedido!');
    return true;
  } catch (error) {
    console.error('❌ Erro não tratado ao testar conexão:', error);
    return false;
  }
};

// Executar teste de conexão
if (typeof window !== 'undefined') {
  testConnection()
    .then(connected => {
      if (!connected) {
        console.warn('⚠️ Aviso: Aplicação pode ter funcionalidade limitada devido a problemas de conexão com o Supabase.');
      } else {
        console.log('✅ Conexão com Supabase estabelecida com sucesso!');
      }
    })
    .catch(err => {
      console.error('❌ Erro ao inicializar teste de conexão:', err);
    });
    
  // Tentar definir sessão a partir da URL no carregamento inicial
  setSessionFromUrl()
    .then(session => {
      if (session) {
        console.log('✅ Sessão definida a partir da URL no carregamento inicial');
      }
    })
    .catch(err => {
      console.error('❌ Erro ao tentar definir sessão inicial a partir da URL:', err);
    });
}