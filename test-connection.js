import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase - Credenciais atualizadas
const supabaseUrl = 'https://yjdrejifhfdasaxivsew.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZHJlamlmaGZkYXNheGl2c2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDYxMjgsImV4cCI6MjA2MjM4MjEyOH0._Cd9McHCodDcioXqDqBhK2CYompChlMgIsf0TtBvoqY';

// Inicializar o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔄 Testando conexão com o Supabase...');
  
  try {
    // Tentar listar algumas tabelas para testar a conexão
    const { data: tablesData, error: tablesError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(5);
    
    if (tablesError) {
      console.error('❌ Erro ao listar tabelas:', tablesError);
      
      // Tentar uma consulta mais simples
      console.log('🔄 Tentando consulta alternativa...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ Teste de conexão falhou:', error);
        return false;
      } else {
        console.log('✅ Conexão com Supabase estabelecida com sucesso!');
        console.log('📊 Dados de amostra:', data);
        return true;
      }
    } else {
      console.log('✅ Conexão com Supabase estabelecida com sucesso!');
      console.log('📑 Tabelas encontradas:', tablesData);
      
      // Verificar estrutura da tabela profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (profilesError) {
        console.error('⚠️ Erro ao verificar tabela profiles:', profilesError);
      } else {
        console.log('👤 Estrutura da tabela profiles:', profilesData);
      }
      
      // Verificar estrutura da tabela company_info
      const { data: companyData, error: companyError } = await supabase
        .from('company_info')
        .select('*')
        .limit(1);
      
      if (companyError) {
        console.error('⚠️ Erro ao verificar tabela company_info:', companyError);
      } else {
        console.log('🏢 Estrutura da tabela company_info:', companyData);
      }
      
      return true;
    }
  } catch (error) {
    console.error('❌ Erro não tratado ao testar conexão:', error);
    return false;
  }
}

// Executar o teste de conexão
testConnection()
  .then(() => console.log('✅ Teste de conexão concluído.'))
  .catch(err => console.error('❌ Erro inesperado:', err)); 