-- =============================================
-- MIRANDA MÓVEIS - DATABASE SCHEMA
-- PostgreSQL / Supabase Compatible
-- =============================================
-- Sistema de catálogo para loja de móveis
-- Convenções:
-- - Todas as tabelas usam UUID como primary key
-- - Timestamps automáticos (created_at, updated_at)
-- - Imagens armazenadas como URLs (Cloudinary)
-- =============================================

-- Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA: users
-- Descrição: Usuários do sistema (admin do catálogo)
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

COMMENT ON TABLE users IS 'Usuários administradores do catálogo de móveis';
COMMENT ON COLUMN users.role IS 'Role do usuário: admin, editor, viewer';

-- =============================================
-- TABELA: categories
-- Descrição: Categorias de móveis (Sofás, Mesas, etc.)
-- =============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_order ON categories(display_order);
CREATE INDEX idx_categories_active ON categories(is_active);

COMMENT ON TABLE categories IS 'Categorias de móveis do catálogo';
COMMENT ON COLUMN categories.slug IS 'URL-friendly identifier para a categoria';

-- =============================================
-- TABELA: materials
-- Descrição: Materiais disponíveis (madeiras, tecidos, metais)
-- =============================================
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, -- 'wood', 'fabric', 'metal', 'glass', 'other'
    hex_code CHAR(7), -- Cor representativa (ex: #8B4513 para madeira)
    description TEXT,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_material_type CHECK (type IN ('wood', 'fabric', 'metal', 'glass', 'other'))
);

CREATE INDEX idx_materials_type ON materials(type);
CREATE INDEX idx_materials_custom ON materials(is_custom);
CREATE INDEX idx_materials_order ON materials(display_order);

COMMENT ON TABLE materials IS 'Materiais e acabamentos disponíveis para os móveis';
COMMENT ON COLUMN materials.type IS 'Tipo: wood (madeira), fabric (tecido), metal, glass (vidro), other';
COMMENT ON COLUMN materials.hex_code IS 'Cor representativa do material para exibição';

-- =============================================
-- TABELA: dimensions
-- Descrição: Dimensões/tamanhos padrão dos móveis
-- =============================================
CREATE TABLE dimensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE, -- Ex: "Compacto", "Padrão", "King"
    width_cm DECIMAL(10,2), -- Largura em cm
    height_cm DECIMAL(10,2), -- Altura em cm
    depth_cm DECIMAL(10,2), -- Profundidade em cm
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dimensions_order ON dimensions(display_order);

COMMENT ON TABLE dimensions IS 'Dimensões padrão disponíveis para os móveis';
COMMENT ON COLUMN dimensions.width_cm IS 'Largura em centímetros';
COMMENT ON COLUMN dimensions.height_cm IS 'Altura em centímetros';
COMMENT ON COLUMN dimensions.depth_cm IS 'Profundidade em centímetros';

-- =============================================
-- TABELA: products
-- Descrição: Móveis do catálogo
-- =============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    discount_price DECIMAL(10, 2) CHECK (discount_price >= 0), -- Preço à vista com desconto
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    image_url TEXT,
    weight_kg DECIMAL(10, 2), -- Peso em kg
    warranty_months INTEGER DEFAULT 12, -- Garantia em meses
    assembly_required BOOLEAN NOT NULL DEFAULT TRUE, -- Requer montagem?
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    stock_status VARCHAR(20) NOT NULL DEFAULT 'in_stock',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_stock_status CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock', 'made_to_order'))
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created ON products(created_at DESC);

COMMENT ON TABLE products IS 'Móveis do catálogo';
COMMENT ON COLUMN products.slug IS 'URL-friendly identifier para o produto';
COMMENT ON COLUMN products.price IS 'Preço em reais (BRL)';
COMMENT ON COLUMN products.discount_price IS 'Preço à vista com desconto';
COMMENT ON COLUMN products.weight_kg IS 'Peso do móvel em quilogramas';
COMMENT ON COLUMN products.warranty_months IS 'Período de garantia em meses';
COMMENT ON COLUMN products.assembly_required IS 'Se o móvel requer montagem';
COMMENT ON COLUMN products.stock_status IS 'Status: in_stock, low_stock, out_of_stock, made_to_order';

-- NEW: SEO Slug for AI generation
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo_slug TEXT;
COMMENT ON COLUMN products.seo_slug IS 'Slug SEO gerado por IA, separado por hífens';

-- =============================================
-- TABELA: product_images
-- Descrição: Galeria de imagens do produto
-- =============================================
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_order ON product_images(display_order);

COMMENT ON TABLE product_images IS 'Galeria de imagens adicionais do móvel';

-- =============================================
-- TABELA: product_dimensions (Junction Table)
-- Descrição: Dimensões disponíveis por produto (N:N)
-- =============================================
CREATE TABLE product_dimensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    dimension_id UUID NOT NULL REFERENCES dimensions(id) ON DELETE CASCADE,
    custom_width_cm DECIMAL(10,2), -- Dimensão customizada (sobrescreve padrão)
    custom_height_cm DECIMAL(10,2),
    custom_depth_cm DECIMAL(10,2),
    price_adjustment DECIMAL(10,2) DEFAULT 0, -- Ajuste de preço para esta dimensão
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, dimension_id)
);

CREATE INDEX idx_product_dimensions_product ON product_dimensions(product_id);
CREATE INDEX idx_product_dimensions_dimension ON product_dimensions(dimension_id);

COMMENT ON TABLE product_dimensions IS 'Relação N:N entre produtos e dimensões';
COMMENT ON COLUMN product_dimensions.price_adjustment IS 'Ajuste de preço para dimensões maiores/menores';

-- =============================================
-- TABELA: product_materials (Junction Table)
-- Descrição: Materiais disponíveis por produto (N:N)
-- =============================================
CREATE TABLE product_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    image_url TEXT, -- Imagem do produto neste material
    price_adjustment DECIMAL(10,2) DEFAULT 0, -- Ajuste de preço para este material
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, material_id)
);

CREATE INDEX idx_product_materials_product ON product_materials(product_id);
CREATE INDEX idx_product_materials_material ON product_materials(material_id);

COMMENT ON TABLE product_materials IS 'Relação N:N entre produtos e materiais';
COMMENT ON COLUMN product_materials.image_url IS 'Imagem do produto neste material específico';

-- =============================================
-- TABELA: user_settings
-- Descrição: Configurações personalizadas por usuário
-- =============================================
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme_id VARCHAR(50) NOT NULL DEFAULT 'miranda-dark',
    language VARCHAR(10) NOT NULL DEFAULT 'pt-BR',
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    catalog_view_mode VARCHAR(20) NOT NULL DEFAULT 'cards',
    settings_json JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);

COMMENT ON TABLE user_settings IS 'Preferências e configurações do usuário';

-- =============================================
-- FUNCTIONS: Atualização automática de updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_materials_updated_at
    BEFORE UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
