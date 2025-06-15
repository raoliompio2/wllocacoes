-- SCRIPT PARA EXPORTAR DADOS DAS TABELAS PRINCIPAIS
-- Execute cada SELECT individualmente e exporte os resultados como CSV ou JSON

-- EXPORTAR PERFIS DE USUÁRIOS
SELECT * FROM profiles ORDER BY id;

-- EXPORTAR CATEGORIAS
SELECT * FROM categories ORDER BY id;

-- EXPORTAR EQUIPAMENTOS
SELECT * FROM equipment ORDER BY id;

-- EXPORTAR ACESSÓRIOS
SELECT * FROM accessories ORDER BY id;

-- EXPORTAR ACESSÓRIOS DOS EQUIPAMENTOS
SELECT * FROM equipment_accessories ORDER BY equipment_id, accessory_id;

-- EXPORTAR IMAGENS DOS EQUIPAMENTOS
SELECT * FROM equipment_images ORDER BY equipment_id;

-- EXPORTAR MANUTENÇÕES DE EQUIPAMENTOS
SELECT * FROM equipment_maintenance ORDER BY id;

-- EXPORTAR RESERVAS/BOOKINGS
SELECT * FROM bookings ORDER BY id;

-- EXPORTAR SOLICITAÇÕES DE ORÇAMENTO
SELECT * FROM budget_requests ORDER BY id;

-- EXPORTAR MENSAGENS DE ORÇAMENTO
SELECT * FROM budget_messages ORDER BY id;

-- EXPORTAR INFORMAÇÕES DA EMPRESA
SELECT * FROM company_info ORDER BY id;

-- EXPORTAR FASES DE CONSTRUÇÃO (se aplicável)
SELECT * FROM construction_phases ORDER BY id;

-- EXPORTAR RELACIONAMENTO EQUIPAMENTO-CATEGORIA
SELECT * FROM equipment_categories ORDER BY equipment_id, category_id;

-- EXPORTAR AVALIAÇÕES
SELECT * FROM reviews ORDER BY id;

-- EXPORTAR NOTIFICAÇÕES
SELECT * FROM notifications ORDER BY id;

-- EXPORTAR DISPONIBILIDADE DOS EQUIPAMENTOS (se aplicável)
SELECT * FROM equipment_availability ORDER BY equipment_id, id;

-- NOTA: Para tabelas muito grandes, considere exportar em lotes
-- Por exemplo:
-- SELECT * FROM nome_tabela WHERE id BETWEEN 1 AND 1000 ORDER BY id;
-- SELECT * FROM nome_tabela WHERE id BETWEEN 1001 AND 2000 ORDER BY id;
-- E assim por diante 