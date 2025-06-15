import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { updateCompanyWhatsapp } from '../utils/updateWhatsapp';

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
  name: 'NOME DA EMPRESA',
  logo_url: '',
  phone: '(00) 0000-0000',
  whatsapp: '0000000000',
  email: 'contato@seudominio.com.br',
  address: 'Endereço da empresa, Número - Bairro, Cidade - UF, 00000-000',
};

const CompanyContext = createContext<CompanyContextType>({
  companyInfo: defaultCompanyInfo,
  loading: true,
  error: null
});

export const useCompany = () => useContext(CompanyContext);

// Correção na definição do componente para garantir que seja um componente de função React válido
const CompanyProvider = ({ children }: { children: React.ReactNode }) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        // Tentar buscar da tabela company_info
        const { data, error } = await supabase
          .from('company_info')
          .select('*')
          .limit(1)
          .single();

        if (error) {
          console.log('Erro ao buscar do banco, usando solução alternativa:', error);
          
          // Se houver erro, usar a função updateCompanyWhatsapp que retorna dados locais
          const alternativeData = await updateCompanyWhatsapp();
          
          if (typeof alternativeData === 'object') {
            setCompanyInfo({
              ...defaultCompanyInfo,
              ...alternativeData,
              logo_url: defaultCompanyInfo.logo_url // Manter o logo_url do defaultCompanyInfo
            });
          } else {
            // Se updateCompanyWhatsapp retornar true, usar valores padrão
            setCompanyInfo(defaultCompanyInfo);
          }
        } else if (data) {
          // Dados obtidos com sucesso do banco
          setCompanyInfo({
            name: data.name || defaultCompanyInfo.name,
            phone: data.phone || defaultCompanyInfo.phone,
            whatsapp: data.whatsapp || defaultCompanyInfo.whatsapp,
            email: data.email || defaultCompanyInfo.email,
            address: data.address || defaultCompanyInfo.address,
            logo_url: data.logo_url || defaultCompanyInfo.logo_url,
          });
        } else {
          // Se não houver dados, usar valores padrão
          setCompanyInfo(defaultCompanyInfo);
        }
        
        setLoading(false);
      } catch (err) {
        console.log('Erro ao buscar informações da empresa, usando valores padrão:', err);
        // Em caso de erro, usar os valores padrão
        setCompanyInfo(defaultCompanyInfo);
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, []);

  return (
    <CompanyContext.Provider value={{ companyInfo, loading, error }}>
      {children}
    </CompanyContext.Provider>
  );
};

export { CompanyProvider }; 