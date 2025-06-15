import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, clearAuthCache, refreshSession } from '../utils/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setCurrentSession: (session: Session) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Método para definir a sessão atual manualmente quando necessário
  const setCurrentSession = (newSession: Session) => {
    if (newSession) {
      setSession(newSession);
      setUser(newSession.user);
    }
  };

  // Limpar hash da URL quando contiver access_token
  useEffect(() => {
    // Verifica se a URL tem hash com token
    if (window.location.hash && window.location.hash.includes('access_token')) {
      // Processar os tokens do hash para tentar configurar a sessão
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        // Configura a sessão com os tokens recebidos
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ data, error }) => {
          if (error) {
            console.error('Erro ao definir sessão a partir de tokens na URL:', error);
          } else if (data.session) {
            console.log('Sessão configurada a partir da URL');
            setSession(data.session);
            setUser(data.session.user);
          }
        });
      }
      
      // Após o Supabase processar o token, limpa o hash da URL
      setTimeout(() => {
        // Usa history.replaceState para remover o hash sem recarregar a página
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', cleanUrl);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Tenta renovar a sessão para garantir que esteja atualizada
        await refreshSession();
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão inicial:', error);
          throw error;
        }
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Erro ao obter sessão inicial:', error);
        // Em caso de erro, limpar os dados de sessão local
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log('Mudança de estado de autenticação detectada:', _event);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log(`Tentando login com email: ${email}`);
      
      // Limpar qualquer sessão residual para evitar conflitos
      clearAuthCache();
      
      const { error: signOutError } = await supabase.auth.signOut({
        scope: 'local'
      });
      
      if (signOutError) {
        console.warn('Erro ao limpar sessão anterior:', signOutError);
      }
      
      // Tentar login com retry em caso de falha de rede
      let retries = 2;
      let error = null;
      
      while (retries >= 0) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ 
          email, 
          password
        });
        
        if (!signInError) {
          console.log('Login bem-sucedido:', data.session ? 'Sessão obtida' : 'Sem sessão');
          return;
        }
        
        error = signInError;
        
        if (signInError.message !== 'Network Error' && signInError.message !== 'Failed to fetch') {
          break; // Não tentar novamente se não for erro de rede
        }
        
        retries--;
        if (retries >= 0) {
          console.log(`Tentativa de login falhou, tentando novamente. Restam ${retries + 1} tentativas.`);
          // Esperar antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (error) {
        console.error('Erro no login:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Limpar estado local
      setUser(null);
      setSession(null);
      
      // Limpar o localStorage para garantir que dados antigos não persistam
      clearAuthCache();
      
      // Executar o signOut do Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'local' // Isso garante que apenas a sessão atual seja encerrada
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Determinar a URL de redirecionamento com base no ambiente
      let redirectUrl = `${window.location.origin}/reset-password`;
      
      // Verificar se estamos na produção (Vercel)
      if (window.location.hostname.includes('vercel.app') || 
          !window.location.hostname.includes('localhost')) {
        // Certificar-se de usar HTTPS na produção
        redirectUrl = `https://${window.location.host}/reset-password`;
      }
      
      console.log(`Solicitando redefinição de senha para ${email} com redirecionamento para: ${redirectUrl}`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error('Erro ao solicitar redefinição de senha:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      throw error;
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    setCurrentSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};