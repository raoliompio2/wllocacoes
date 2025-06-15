-- LISTAR TODAS AS TABELAS DO ESQUEMA PUBLIC
SELECT
    table_name,
    table_type
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
ORDER BY
    table_name;

-- LISTAR DETALHES DE COLUNAS DE TODAS AS TABELAS
SELECT
    t.table_name,
    c.column_name,
    c.data_type,
    c.column_default,
    c.is_nullable,
    c.character_maximum_length,
    c.numeric_precision,
    c.numeric_scale
FROM
    information_schema.tables t
    JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE
    t.table_schema = 'public'
    AND c.table_schema = 'public'
ORDER BY
    t.table_name,
    c.ordinal_position;

-- LISTAR TODAS AS RESTRIÇÕES (CONSTRAINTS)
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    LEFT JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE
    tc.constraint_schema = 'public'
ORDER BY
    tc.table_name,
    tc.constraint_name;

-- LISTAR TODOS OS ÍNDICES
SELECT
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
ORDER BY
    tablename,
    indexname;

-- LISTAR POLÍTICAS RLS (ROW LEVEL SECURITY)
SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    p.polname AS policy_name,
    p.polpermissive,
    CASE WHEN (p.polroles = '{0}') THEN 'PUBLIC' ELSE array_to_string(array(select rolname from pg_roles where oid = any(p.polroles)), ', ') END AS roles,
    CASE p.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
    END AS command,
    pg_get_expr(p.polqual, p.polrelid) AS using_expression,
    pg_get_expr(p.polwithcheck, p.polrelid) AS check_expression
FROM
    pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE
    n.nspname = 'public'
ORDER BY
    n.nspname,
    c.relname,
    p.polname;

-- LISTAR FUNÇÕES PERSONALIZADAS
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_arguments(p.oid) AS function_arguments,
    t.typname AS return_type,
    p.prosrc AS function_body
FROM
    pg_proc p
    LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
    LEFT JOIN pg_type t ON p.prorettype = t.oid
WHERE
    n.nspname = 'public'
ORDER BY
    n.nspname,
    p.proname;

-- LISTAR TRIGGERS
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM
    information_schema.triggers
WHERE
    trigger_schema = 'public'
ORDER BY
    event_object_table,
    trigger_name;

-- LISTAR CONFIGURAÇÕES DE STORAGE (verificar se existe)
-- Comentado para evitar erros se o esquema storage não existir
/*
SELECT
    name,
    id,
    owner,
    created_at,
    updated_at,
    public,
    file_size_limit,
    allowed_mime_types
FROM
    storage.buckets
ORDER BY
    name;
*/

-- VERIFICAR ESQUEMAS DISPONÍVEIS
SELECT 
    schema_name
FROM 
    information_schema.schemata
ORDER BY 
    schema_name;

-- VERIFICAR TODAS AS TABELAS EM TODOS OS ESQUEMAS
SELECT 
    table_schema,
    table_name
FROM 
    information_schema.tables
WHERE 
    table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY 
    table_schema,
    table_name; 