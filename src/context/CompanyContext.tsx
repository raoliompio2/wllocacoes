import React, { createContext, useContext, useState, useEffect } from 'react';
// import { supabase } from '../utils/supabaseClient';
// import { updateCompanyWhatsapp } from '../utils/updateWhatsapp';

interface CompanyInfo {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  logo_url: string;
}

interface CompanyContextType {
  companyInfo: CompanyInfo;
  loading: boolean;
  error: string | null;
}

// Valores padrão para informações da empresa
const defaultCompanyInfo: CompanyInfo = {
  name: 'Panda Locações',
  logo_url: '/images/Logo Panda.png',
  phone: '(00) 0000-0000',
  whatsapp: '0000000000',
  email: 'contato@pandalocacoes.com.br',
  address: 'Endereço da Panda Locações, Número - Bairro, Cidade - UF, 00000-000',
};

const CompanyContext = createContext<CompanyContextType>({
  companyInfo: defaultCompanyInfo,
  loading: true,
  error: null
});

export const useCompany = () => useContext(CompanyContext);

interface CompanyProviderProps {
  children: React.ReactNode;
}

// Definição do componente como uma função de componente React adequada
const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Versão simplificada que apenas usa os valores padrão
    // para evitar erros de autenticação com o Supabase
    const initializeCompanyInfo = () => {
      try {
        setLoading(true);
        setError(null);
        
        // Usar apenas os valores padrão
        setCompanyInfo(defaultCompanyInfo);
        
        setLoading(false);
      } catch (err) {
        console.log('Erro ao inicializar informações da empresa:', err);
        setError('Erro ao carregar informações da empresa');
        setLoading(false);
      }
    };

    initializeCompanyInfo();
  }, []);

  return (
    <CompanyContext.Provider value={{ companyInfo, loading, error }}>
      {children}
    </CompanyContext.Provider>
  );
};

export { CompanyProvider }; 