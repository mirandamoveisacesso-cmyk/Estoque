-- Migration: Refactor products table to single-table architecture
-- Description: Flattens the product structure, removing relational tables and adding necessary columns to products table.

-- 1. Drop relational tables and other dependencies
DROP TABLE IF EXISTS product_dimensions CASCADE;
DROP TABLE IF EXISTS product_materials CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS dimensions CASCADE;
DROP TABLE IF EXISTS materials CASCADE;

-- 2. Modify products table
ALTER TABLE products 
    -- Remove unused columns
    DROP COLUMN IF EXISTS category_id,
    DROP COLUMN IF EXISTS stock_status,
    DROP COLUMN IF EXISTS weight_kg,
    DROP COLUMN IF EXISTS warranty_months,
    DROP COLUMN IF EXISTS assembly_required,
    
    -- Add new columns
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS sector TEXT,
    ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS description TEXT, -- Ensure it exists
    ADD COLUMN IF NOT EXISTS colors TEXT, -- Storing as text (comma separated or simple string)
    ADD COLUMN IF NOT EXISTS models TEXT,
    ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2), -- Ensure it exists (was DECIMAL)
    ADD COLUMN IF NOT EXISTS dimensions TEXT, -- renamed from implicit relation to text field
    ADD COLUMN IF NOT EXISTS is_kit BOOLEAN DEFAULT FALSE;

-- 3. Update comments
COMMENT ON TABLE products IS 'Tabela única de produtos com estrutura simplificada';
COMMENT ON COLUMN products.category IS 'Categoria do produto (ex: Sofás, Mesas)';
COMMENT ON COLUMN products.sector IS 'Setor do produto';
COMMENT ON COLUMN products.stock_quantity IS 'Quantidade em estoque';
COMMENT ON COLUMN products.colors IS 'Cores disponíveis (texto livre)';
COMMENT ON COLUMN products.models IS 'Modelos disponíveis (texto livre)';
COMMENT ON COLUMN products.dimensions IS 'Medidas disponíveis (texto livre)';
COMMENT ON COLUMN products.is_kit IS 'Indica se é um kit de produtos';
