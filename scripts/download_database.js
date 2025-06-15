/**
 * Script para conectar ao Supabase e baixar um dump do banco de dados PostgreSQL
 * Dependências necessárias:
 * - dotenv: Para carregar variáveis de ambiente
 * - @supabase/supabase-js: Cliente Supabase
 * - node-postgres (pg): Para executar comandos SQL diretamente
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Configuração
dotenv.config();

const execPromise = promisify(exec);

// Verifica se as variáveis de ambiente necessárias estão definidas
// Usando as novas credenciais quando não encontrar no ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zwtnjjehmuhnxftrjmvm.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
                   process.env.VITE_SUPABASE_ANON_KEY || 
                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dG5qamVobXVobnhmdHJqbXZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzQ5ODcwNywiZXhwIjoyMDYzMDc0NzA3fQ.DggKmzxoC91HFGCFCcdpYOjS1lqBSJhiIiZEafj2LGc';

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY são necessárias.');
  console.error('Adicione essas variáveis ao arquivo .env na raiz do projeto.');
  process.exit(1);
}

// Verifica se o pg_dump está instalado
async function checkPgDump() {
  try {
    await execPromise('pg_dump --version');
    return true;
  } catch (error) {
    console.error('ERRO: pg_dump não encontrado. Você precisa instalar o PostgreSQL client tools.');
    console.error('Windows: Instale PostgreSQL a partir de https://www.postgresql.org/download/windows/');
    return false;
  }
}

// Obtém informações de conexão do banco de dados Supabase
async function getDatabaseInfo() {
  try {
    // Inicializa o cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Obtém informações de conexão usando a função do sistema
    const { data, error } = await supabase.rpc('get_connection_info');
    
    if (error) {
      console.error('Erro ao obter informações de conexão:', error.message);
      
      // Sugerindo criar a função se ela não existir
      console.log('Você precisa criar a função get_connection_info no seu projeto Supabase.');
      console.log('Execute o SQL a seguir no Editor SQL do Supabase:');
      console.log(`
CREATE OR REPLACE FUNCTION get_connection_info()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'host', current_setting('server_version'), 
    'port', 5432,
    'database', current_database(),
    'user', current_user
  );
$$;
      `);
      
      // Alternativa: usar configuração manual
      console.log('\nAlternativamente, use estes valores manualmente com o pg_dump:');
      console.log(`
Host: db.${supabaseUrl.replace('https://', '')}.supabase.co
Porta: 5432
Banco de dados: postgres
Usuário: obtém no console do Supabase
Senha: obtém no console do Supabase
      `);
      
      process.exit(1);
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error.message);
    process.exit(1);
  }
}

// Função principal para executar o dump
async function downloadDatabase() {
  console.log('Verificando requisitos...');
  
  const pgDumpExists = await checkPgDump();
  if (!pgDumpExists) {
    process.exit(1);
  }
  
  console.log('Obtendo informações de conexão do banco de dados...');
  
  // Instruções manuais para obter informações de conexão do Supabase
  console.log('\nInstruções para criar o dump manualmente:');
  console.log('1. Acesse o console do Supabase: https://app.supabase.com/');
  console.log('2. Navegue até seu projeto > Configurações > Database');
  console.log('3. Obtenha as informações de conexão (Connection string, Host, Password)');
  console.log('4. Use o comando pg_dump com estas informações\n');
  
  // Comando de exemplo
  const host = `db.${supabaseUrl.replace('https://', '')}.supabase.co`;
  const database = 'postgres';
  const username = 'postgres'; // Geralmente é postgres, mas pode variar
  
  console.log('Comando de exemplo para executar no PowerShell:');
  console.log('Substitua USER e PASSWORD pelas informações obtidas no console do Supabase\n');
  
  // Criar pasta de backup se não existir
  const backupDir = path.join(process.cwd(), 'scripts', 'backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Nome do arquivo de backup com data e hora
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const backupFile = path.join(backupDir, `supabase_backup_${timestamp}.sql`);
  
  // Comando para executar o pg_dump
  console.log(`pg_dump "host=${host} port=5432 dbname=${database} user=USER password=PASSWORD" -f "${backupFile}" --clean --if-exists --schema=public,storage`);
  
  console.log('\nAlternativamente, você pode baixar um backup da interface do Supabase:');
  console.log('1. Acesse o console do Supabase: https://app.supabase.com/');
  console.log('2. Navegue até seu projeto > Banco de dados > Backup diário');
  console.log('3. Baixe o backup mais recente\n');
}

// Executa a função principal
downloadDatabase().catch((error) => {
  console.error('Erro ao executar o script:', error);
  process.exit(1);
}); 