-- =============================================
-- MIRANDA MÓVEIS - DROP ALL TABLES
-- Execute este script ANTES do schema.sql
-- para limpar tabelas existentes
-- =============================================

-- Desabilita verificação de foreign keys temporariamente
SET session_replication_role = 'replica';

-- Drop junction tables primeiro (dependem de outras)
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_dimensions CASCADE;
DROP TABLE IF EXISTS product_materials CASCADE;
DROP TABLE IF EXISTS product_sizes CASCADE;
DROP TABLE IF EXISTS product_colors CASCADE;

-- Drop tabelas de configuração
DROP TABLE IF EXISTS user_settings CASCADE;

-- Drop tabelas principais
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS dimensions CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS sizes CASCADE;
DROP TABLE IF EXISTS colors CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop function e triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Reabilita verificação de foreign keys
SET session_replication_role = 'origin';

-- Confirma que tudo foi removido
SELECT 'Tabelas removidas com sucesso!' as status;
