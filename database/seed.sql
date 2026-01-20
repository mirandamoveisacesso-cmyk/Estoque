-- =============================================
-- MIRANDA MÓVEIS - SEED DATA
-- Dados iniciais para o sistema de móveis
-- =============================================

-- =============================================
-- SEED: Dimensões padrão
-- =============================================
INSERT INTO dimensions (name, width_cm, height_cm, depth_cm, display_order) VALUES
    ('Compacto', 120, 75, 60, 1),
    ('Padrão', 180, 85, 80, 2),
    ('Grande', 240, 90, 90, 3),
    ('King', 300, 95, 100, 4);

-- =============================================
-- SEED: Materiais padrão do sistema
-- =============================================
-- Madeiras
INSERT INTO materials (name, type, hex_code, description, is_custom, display_order) VALUES
    ('Madeira Maciça', 'wood', '#8B4513', 'Madeira maciça de alta qualidade', FALSE, 1),
    ('MDF Freijó', 'wood', '#D2B48C', 'MDF com acabamento cor freijó', FALSE, 2),
    ('MDF Branco', 'wood', '#F5F5F5', 'MDF com acabamento branco', FALSE, 3),
    ('MDF Preto', 'wood', '#2D2D2D', 'MDF com acabamento preto fosco', FALSE, 4),
    ('MDF Carvalho', 'wood', '#DEB887', 'MDF com acabamento carvalho', FALSE, 5),
    ('Compensado Naval', 'wood', '#CD853F', 'Compensado naval resistente à umidade', FALSE, 6);

-- Tecidos
INSERT INTO materials (name, type, hex_code, description, is_custom, display_order) VALUES
    ('Linho Cru', 'fabric', '#FAF0E6', 'Tecido de linho natural', FALSE, 10),
    ('Linho Cinza', 'fabric', '#A9A9A9', 'Tecido de linho cinza', FALSE, 11),
    ('Veludo Verde', 'fabric', '#228B22', 'Veludo premium verde musgo', FALSE, 12),
    ('Veludo Azul', 'fabric', '#4169E1', 'Veludo premium azul royal', FALSE, 13),
    ('Veludo Terracota', 'fabric', '#E2725B', 'Veludo premium terracota', FALSE, 14),
    ('Couro Marrom', 'fabric', '#8B4513', 'Couro natural marrom', FALSE, 15),
    ('Couro Preto', 'fabric', '#1a1a1a', 'Couro natural preto', FALSE, 16),
    ('Couro Caramelo', 'fabric', '#D2691E', 'Couro natural caramelo', FALSE, 17),
    ('Suede Bege', 'fabric', '#F5DEB3', 'Suede sintético bege', FALSE, 18);

-- Metais
INSERT INTO materials (name, type, hex_code, description, is_custom, display_order) VALUES
    ('Metal Dourado', 'metal', '#FFD700', 'Metal com acabamento dourado', FALSE, 20),
    ('Metal Preto Fosco', 'metal', '#2D2D2D', 'Metal com pintura preta fosca', FALSE, 21),
    ('Metal Cromado', 'metal', '#C0C0C0', 'Metal cromado espelhado', FALSE, 22),
    ('Metal Rose Gold', 'metal', '#B76E79', 'Metal com acabamento rose gold', FALSE, 23),
    ('Ferro Industrial', 'metal', '#4A4A4A', 'Ferro com acabamento industrial', FALSE, 24);

-- Vidro
INSERT INTO materials (name, type, hex_code, description, is_custom, display_order) VALUES
    ('Vidro Transparente', 'glass', '#E0FFFF', 'Vidro temperado transparente', FALSE, 30),
    ('Vidro Fumê', 'glass', '#696969', 'Vidro temperado fumê', FALSE, 31),
    ('Vidro Espelhado', 'glass', '#C0C0C0', 'Vidro espelhado', FALSE, 32);

-- =============================================
-- SEED: Categorias de móveis
-- =============================================
INSERT INTO categories (name, slug, description, display_order) VALUES
    ('Sofás', 'sofas', 'Sofás, poltronas e estofados para sala de estar', 1),
    ('Mesas', 'mesas', 'Mesas de jantar, centro, laterais e de apoio', 2),
    ('Cadeiras', 'cadeiras', 'Cadeiras de jantar, escritório e decorativas', 3),
    ('Camas', 'camas', 'Camas de casal, solteiro e box spring', 4),
    ('Estantes', 'estantes', 'Estantes, racks e painéis de TV', 5),
    ('Armários', 'armarios', 'Armários, guarda-roupas e closets', 6),
    ('Cômodas', 'comodas', 'Cômodas, criados-mudos e gaveteiros', 7),
    ('Escrivaninhas', 'escrivaninhas', 'Escrivaninhas e mesas de escritório', 8),
    ('Acessórios', 'acessorios', 'Almofadas, mantas e objetos decorativos', 9);

-- =============================================
-- SEED: Usuário admin padrão
-- Senha: admin123 (hash bcrypt)
-- =============================================
INSERT INTO users (email, password_hash, name, role) VALUES
    ('admin@mirandamoveis.com', '$2b$10$rQZ8K7.xE8r5C5X5N5N5NuH7F7F7F7F7F7F7F7F7F7F7F7F7F7F7F7', 'Administrador', 'admin');

-- Configurações padrão para o admin
INSERT INTO user_settings (user_id, theme_id, catalog_view_mode)
SELECT id, 'miranda-dark', 'cards' FROM users WHERE email = 'admin@mirandamoveis.com';

-- =============================================
-- SEED: Produtos de exemplo
-- =============================================

-- Sofá 3 Lugares Copenhague
INSERT INTO products (name, slug, description, price, discount_price, category_id, weight_kg, warranty_months, assembly_required, is_featured)
SELECT 
    'Sofá 3 Lugares Copenhague',
    'sofa-3-lugares-copenhague',
    'Sofá moderno de 3 lugares com design escandinavo. Estrutura em madeira maciça e estofamento em linho premium. Pés palito em madeira natural.',
    3490.00,
    2990.00,
    id,
    45.0,
    24,
    FALSE,
    TRUE
FROM categories WHERE slug = 'sofas';

-- Mesa de Jantar Milão
INSERT INTO products (name, slug, description, price, discount_price, category_id, weight_kg, warranty_months, assembly_required, is_featured)
SELECT 
    'Mesa de Jantar Milão',
    'mesa-de-jantar-milao',
    'Mesa de jantar retangular para 6 lugares. Tampo em MDF com acabamento premium e pés em metal dourado. Design contemporâneo e elegante.',
    2890.00,
    2590.00,
    id,
    35.0,
    12,
    TRUE,
    TRUE
FROM categories WHERE slug = 'mesas';

-- Poltrona Bergère Clássica
INSERT INTO products (name, slug, description, price, category_id, weight_kg, warranty_months, assembly_required)
SELECT 
    'Poltrona Bergère Clássica',
    'poltrona-bergere-classica',
    'Poltrona bergère com design clássico atemporal. Estrutura em madeira maciça e estofamento em veludo. Perfeita para cantinhos de leitura.',
    1890.00,
    id,
    18.0,
    12,
    FALSE
FROM categories WHERE slug = 'sofas';

-- Estante Modular Oslo
INSERT INTO products (name, slug, description, price, category_id, weight_kg, warranty_months, assembly_required)
SELECT 
    'Estante Modular Oslo',
    'estante-modular-oslo',
    'Estante modular com nichos abertos e fechados. Ideal para livros, objetos decorativos e aparelhos eletrônicos. Sistema de fixação incluso.',
    1490.00,
    id,
    28.0,
    12,
    TRUE
FROM categories WHERE slug = 'estantes';

-- Cama Box Queen Londres
INSERT INTO products (name, slug, description, price, discount_price, category_id, weight_kg, warranty_months, assembly_required, is_featured)
SELECT 
    'Cama Box Queen Londres',
    'cama-box-queen-londres',
    'Cama box queen size com cabeceira estofada. Estrutura reforçada em MDF e base em madeira maciça. Inclui cabeceira e base.',
    2490.00,
    2190.00,
    id,
    55.0,
    24,
    TRUE,
    TRUE
FROM categories WHERE slug = 'camas';

-- =============================================
-- Associar dimensões aos produtos
-- =============================================
INSERT INTO product_dimensions (product_id, dimension_id, stock_quantity)
SELECT p.id, d.id, 5
FROM products p
CROSS JOIN dimensions d
WHERE p.slug = 'sofa-3-lugares-copenhague' AND d.name IN ('Padrão', 'Grande');

INSERT INTO product_dimensions (product_id, dimension_id, stock_quantity)
SELECT p.id, d.id, 3
FROM products p
CROSS JOIN dimensions d
WHERE p.slug = 'mesa-de-jantar-milao' AND d.name IN ('Padrão', 'Grande', 'King');

INSERT INTO product_dimensions (product_id, dimension_id, stock_quantity)
SELECT p.id, d.id, 8
FROM products p
CROSS JOIN dimensions d
WHERE p.slug = 'poltrona-bergere-classica' AND d.name = 'Padrão';

INSERT INTO product_dimensions (product_id, dimension_id, stock_quantity)
SELECT p.id, d.id, 4
FROM products p
CROSS JOIN dimensions d
WHERE p.slug = 'estante-modular-oslo' AND d.name IN ('Compacto', 'Padrão', 'Grande');

INSERT INTO product_dimensions (product_id, dimension_id, stock_quantity)
SELECT p.id, d.id, 6
FROM products p
CROSS JOIN dimensions d
WHERE p.slug = 'cama-box-queen-londres' AND d.name IN ('Padrão', 'King');

-- =============================================
-- Associar materiais aos produtos
-- =============================================
INSERT INTO product_materials (product_id, material_id)
SELECT p.id, m.id
FROM products p
CROSS JOIN materials m
WHERE p.slug = 'sofa-3-lugares-copenhague' AND m.name IN ('Linho Cru', 'Linho Cinza', 'Veludo Verde', 'Veludo Azul');

INSERT INTO product_materials (product_id, material_id)
SELECT p.id, m.id
FROM products p
CROSS JOIN materials m
WHERE p.slug = 'mesa-de-jantar-milao' AND m.name IN ('MDF Freijó', 'MDF Branco', 'MDF Preto', 'Metal Dourado');

INSERT INTO product_materials (product_id, material_id)
SELECT p.id, m.id
FROM products p
CROSS JOIN materials m
WHERE p.slug = 'poltrona-bergere-classica' AND m.name IN ('Veludo Verde', 'Veludo Azul', 'Veludo Terracota', 'Couro Marrom');

INSERT INTO product_materials (product_id, material_id)
SELECT p.id, m.id
FROM products p
CROSS JOIN materials m
WHERE p.slug = 'estante-modular-oslo' AND m.name IN ('MDF Freijó', 'MDF Branco', 'MDF Preto', 'Metal Preto Fosco');

INSERT INTO product_materials (product_id, material_id)
SELECT p.id, m.id
FROM products p
CROSS JOIN materials m
WHERE p.slug = 'cama-box-queen-londres' AND m.name IN ('Linho Cru', 'Veludo Azul', 'Couro Preto', 'MDF Freijó');
