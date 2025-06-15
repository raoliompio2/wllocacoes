import { supabase } from './supabaseClient';

/**
 * Script para atualizar o número de WhatsApp da empresa no banco de dados.
 * Este script é usado para atualizar o número de WhatsApp da empresa.
 * 
 * Nota: Esta função é usada apenas para desenvolvimento e não deve
 * ser usada em produção, pois RLS pode bloquear estas operações.
 */
export const updateCompanyWhatsapp = async () => {
  try {
    // Verificar primeiro se a tabela 'company_info' existe no banco de dados
    try {
      const { data: tableExists, error: tableError } = await supabase
        .from('company_info')
        .select('id')
        .limit(1);
      
      // Se houver erro de permissão ou a tabela não existir, apenas
      // use um objeto local com as informações e não tente modificar o banco de dados
      if (tableError) {
        console.log('Tabela company_info não acessível ou não existe, usando configuração local');
        return {
          name: 'NOME DA EMPRESA',
          whatsapp: '0000000000',
          phone: '(00) 0000-0000',
          email: 'contato@seudominio.com.br',
          address: 'Endereço da empresa, Número - Bairro, Cidade - UF, 00000-000'
        };
      }
    } catch (error) {
      console.log('Erro ao verificar a tabela, usando configuração local:', error);
      return {
        name: 'NOME DA EMPRESA',
        whatsapp: '0000000000',
        phone: '(00) 0000-0000',
        email: 'contato@seudominio.com.br',
        address: 'Endereço da empresa, Número - Bairro, Cidade - UF, 00000-000'
      };
    }

    // Verificar se existe registro na tabela
    const { data: existingData, error: checkError } = await supabase
      .from('company_info')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.log('Erro ao verificar registros, usando configuração local:', checkError);
      return {
        name: 'NOME DA EMPRESA',
        whatsapp: '0000000000',
        phone: '(00) 0000-0000',
        email: 'contato@seudominio.com.br',
        address: 'Endereço da empresa, Número - Bairro, Cidade - UF, 00000-000'
      };
    }

    if (existingData && existingData.length > 0) {
      // Atualizar o número do WhatsApp no registro existente
      const { error: updateError } = await supabase
        .from('company_info')
        .update({ whatsapp: '0000000000' })
        .eq('id', existingData[0].id);
      
      if (updateError) {
        console.log('Erro ao atualizar WhatsApp, usando configuração local:', updateError);
        return {
          name: 'NOME DA EMPRESA',
          whatsapp: '0000000000',
          phone: '(00) 0000-0000',
          email: 'contato@seudominio.com.br',
          address: 'Endereço da empresa, Número - Bairro, Cidade - UF, 00000-000'
        };
      }
      
      console.log('Número de WhatsApp atualizado com sucesso!');
      return true;
    } else {
      // Apenas em desenvolvimento - em produção, não tente inserir se não existir
      if (process.env.NODE_ENV === 'development') {
        // Tentar inserir um novo registro se não existir
        const { error: insertError } = await supabase
          .from('company_info')
          .insert([
            { 
              name: 'NOME DA EMPRESA',
              whatsapp: '0000000000',
              phone: '(00) 0000-0000',
              email: 'contato@seudominio.com.br',
              address: 'Endereço da empresa, Número - Bairro, Cidade - UF, 00000-000'
            }
          ]);
        
        if (insertError) {
          console.log('Erro ao inserir dados, usando configuração local:', insertError);
          return {
            name: 'NOME DA EMPRESA',
            whatsapp: '0000000000',
            phone: '(00) 0000-0000',
            email: 'contato@seudominio.com.br',
            address: 'Endereço da empresa, Número - Bairro, Cidade - UF, 00000-000'
          };
        }
        
        console.log('Dados da empresa inseridos com sucesso!');
        return true;
      } else {
        // Em produção, apenas use os valores padrão
        console.log('Em produção, usando configuração local');
        return {
          name: 'NOME DA EMPRESA',
          whatsapp: '0000000000',
          phone: '(00) 0000-0000',
          email: 'contato@seudominio.com.br',
          address: 'Endereço da empresa, Número - Bairro, Cidade - UF, 00000-000'
        };
      }
    }
  } catch (err) {
    console.log('Erro inesperado, usando configuração local:', err);
    return {
      name: 'NOME DA EMPRESA',
      whatsapp: '0000000000',
      phone: '(00) 0000-0000',
      email: 'contato@seudominio.com.br',
      address: 'Endereço da empresa, Número - Bairro, Cidade - UF, 00000-000'
    };
  }
};

// Executar a função se este arquivo for executado diretamente
if (typeof window !== 'undefined') {
  // Verificar se estamos no ambiente de desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    updateCompanyWhatsapp();
  }
} 