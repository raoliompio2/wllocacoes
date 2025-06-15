# Backup do Banco de Dados Supabase

Este diretório contém scripts para ajudar no backup e migração do banco de dados Supabase para outra conta.

## Scripts disponíveis

1. **list_schema.sql** - Lista toda a estrutura do banco de dados
2. **export_data.sql** - Comandos para exportar dados das tabelas principais
3. **create_template.sql** - Modelo de script para recriar o banco de dados no novo ambiente

## Como usar o script de listagem de esquema

O arquivo `list_schema.sql` contém consultas SQL que listam todos os objetos importantes no seu banco de dados, incluindo:

- Tabelas
- Estrutura de colunas
- Restrições (chaves primárias, estrangeiras)
- Índices
- Políticas de segurança em nível de linha (RLS)
- Funções personalizadas
- Triggers
- Esquemas disponíveis

### Passos para executar:

1. Acesse o painel do Supabase (https://app.supabase.com)
2. Selecione seu projeto
3. Vá para a seção "SQL Editor"
4. Copie e cole o conteúdo do arquivo `list_schema.sql`
5. Execute a consulta
6. Para cada seção de resultados:
   - Clique em "Download" ou copie os resultados
   - Envie esses resultados para o desenvolvedor que está ajudando com a migração

## Como exportar os dados

O arquivo `export_data.sql` contém comandos SQL para exportar os dados de todas as tabelas principais:

1. Acesse o painel do Supabase
2. Vá para a seção "SQL Editor"
3. Copie e cole uma consulta por vez do arquivo `export_data.sql`
4. Execute a consulta
5. Clique em "Download" para baixar os resultados como CSV
6. Repita para cada tabela que deseja exportar

## Como recriar o banco de dados

O arquivo `create_template.sql` fornece um modelo para recriar a estrutura do banco de dados em uma nova conta Supabase:

1. Crie um novo projeto no Supabase
2. Compare os resultados obtidos de `list_schema.sql` com o modelo em `create_template.sql`
3. Ajuste o script conforme necessário para corresponder à estrutura exata do seu banco de dados
4. Execute o script ajustado no novo projeto
5. Importe os dados exportados com `export_data.sql`

## Processo completo de migração para outro projeto Supabase

1. **Exportar a estrutura do banco**:
   - Execute `list_schema.sql` no projeto original
   - Analise os resultados para entender a estrutura

2. **Preparar script de criação**:
   - Use `create_template.sql` como base
   - Ajuste com as informações coletadas

3. **Exportar os dados**:
   - Execute `export_data.sql` no projeto original
   - Baixe os resultados de cada tabela em CSV

4. **Recriar o banco no novo projeto**:
   - Execute o script de criação ajustado
   - Importe os dados exportados

5. **Configurar o ambiente**:
   - Atualize as variáveis de ambiente em `.env.local` com as novas credenciais
   - Ajuste as permissões de acesso no painel do Supabase

## Importando dados no novo projeto

Para cada arquivo CSV exportado:

1. Acesse o painel do novo projeto Supabase
2. Vá para a seção "Table Editor"
3. Selecione a tabela correspondente
4. Clique em "Import" e selecione o arquivo CSV
5. Mapeie os campos corretamente
6. Confirme a importação

## Observações importantes

- As senhas de usuários e tokens JWT não serão transferidos diretamente
- Será necessário configurar novamente as variáveis de ambiente no seu projeto
- Os buckets de armazenamento precisarão ter seus arquivos transferidos manualmente 