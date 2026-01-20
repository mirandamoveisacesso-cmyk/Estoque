# 📊 Diagrama ER - Miranda Móveis

## Diagrama de Entidade-Relacionamento

```mermaid
erDiagram
    users ||--o| user_settings : "has"
    users {
        uuid id PK
        varchar email UK
        varchar password_hash
        varchar name
        varchar role
        text avatar_url
        boolean is_active
        timestamptz last_login_at
        timestamptz created_at
        timestamptz updated_at
    }

    user_settings {
        uuid id PK
        uuid user_id FK
        varchar theme_id
        varchar language
        boolean notifications_enabled
        varchar catalog_view_mode
        jsonb settings_json
        timestamptz created_at
        timestamptz updated_at
    }

    categories ||--o{ products : "contains"
    categories {
        uuid id PK
        varchar name UK
        varchar slug UK
        text description
        text image_url
        integer display_order
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    products ||--o{ product_dimensions : "has"
    products ||--o{ product_materials : "has"
    products ||--o{ product_images : "has"
    products {
        uuid id PK
        varchar name
        varchar slug UK
        text description
        decimal price
        decimal discount_price
        uuid category_id FK
        text image_url
        decimal weight_kg
        integer warranty_months
        boolean assembly_required
        boolean is_active
        boolean is_featured
        varchar stock_status
        timestamptz created_at
        timestamptz updated_at
    }

    dimensions ||--o{ product_dimensions : "used_by"
    dimensions {
        uuid id PK
        varchar name UK
        decimal width_cm
        decimal height_cm
        decimal depth_cm
        integer display_order
        boolean is_active
        timestamptz created_at
    }

    materials ||--o{ product_materials : "used_by"
    materials {
        uuid id PK
        varchar name UK
        varchar type
        char hex_code
        text description
        boolean is_custom
        integer display_order
        timestamptz created_at
        timestamptz updated_at
    }

    product_dimensions {
        uuid id PK
        uuid product_id FK
        uuid dimension_id FK
        decimal custom_width_cm
        decimal custom_height_cm
        decimal custom_depth_cm
        decimal price_adjustment
        integer stock_quantity
        timestamptz created_at
    }

    product_materials {
        uuid id PK
        uuid product_id FK
        uuid material_id FK
        text image_url
        decimal price_adjustment
        timestamptz created_at
    }

    product_images {
        uuid id PK
        uuid product_id FK
        text image_url
        varchar alt_text
        integer display_order
        boolean is_primary
        timestamptz created_at
    }
```

## 📋 Legenda

| Símbolo | Significado |
|---------|-------------|
| `PK` | Primary Key |
| `FK` | Foreign Key |
| `UK` | Unique Key |
| `||--o{` | Um para Muitos |
| `||--o|` | Um para Um |

## 🔗 Relacionamentos

### Users
- Um usuário tem **uma** configuração de preferências (1:1)

### Categories ↔ Products
- Uma categoria contém **muitos** produtos (1:N)
- Um produto pertence a **uma** categoria

### Products ↔ Dimensions
- Um produto tem **muitas** dimensões (via junction table)
- Uma dimensão é usada por **muitos** produtos
- Relacionamento N:N através de `product_dimensions`

### Products ↔ Materials
- Um produto tem **muitos** materiais (via junction table)
- Um material é usado por **muitos** produtos
- Relacionamento N:N através de `product_materials`

### Products ↔ Images
- Um produto tem **muitas** imagens na galeria (1:N)

## 📊 Diagrama de Fluxo de Dados

```mermaid
flowchart TB
    subgraph Frontend["🖥️ Frontend (React)"]
        UI[Interface do Usuário]
        State[Context/State]
    end

    subgraph Backend["⚙️ Backend (Supabase)"]
        API[API REST]
        Auth[Autenticação]
    end

    subgraph Database["🗄️ Database (PostgreSQL)"]
        Users[(users)]
        Products[(products)]
        Categories[(categories)]
        Materials[(materials)]
        Dimensions[(dimensions)]
    end

    subgraph Storage["☁️ Storage (Cloudinary)"]
        Images[Imagens CDN]
    end

    UI --> State
    State --> API
    API --> Auth
    Auth --> Users
    API --> Products
    API --> Categories
    API --> Materials
    API --> Dimensions
    UI --> Images
    API -.->|Upload| Images
```

## 🪵 Tipos de Materiais

| Tipo | Descrição | Exemplos |
|------|-----------|----------|
| `wood` | Madeiras e derivados | Madeira Maciça, MDF, Compensado |
| `fabric` | Tecidos e couros | Linho, Veludo, Couro, Suede |
| `metal` | Metais e ligas | Dourado, Cromado, Ferro |
| `glass` | Vidros | Temperado, Fumê, Espelhado |

## 📏 Dimensões Padrão

| Nome | Largura | Altura | Profundidade | Uso Típico |
|------|---------|--------|--------------|------------|
| Compacto | 120cm | 75cm | 60cm | Apartamentos pequenos |
| Padrão | 180cm | 85cm | 80cm | Uso geral |
| Grande | 240cm | 90cm | 90cm | Ambientes amplos |
| King | 300cm | 95cm | 100cm | Camas e sofás grandes |

## 🏷️ Categorias de Móveis

| Categoria | Slug | Descrição |
|-----------|------|-----------|
| Sofás | sofas | Sofás, poltronas e estofados |
| Mesas | mesas | Mesas de jantar, centro, laterais |
| Cadeiras | cadeiras | Cadeiras de jantar, escritório |
| Camas | camas | Camas de casal, solteiro, box |
| Estantes | estantes | Estantes, racks, painéis de TV |
| Armários | armarios | Guarda-roupas e closets |
| Cômodas | comodas | Cômodas e criados-mudos |
| Escrivaninhas | escrivaninhas | Mesas de escritório |
| Acessórios | acessorios | Almofadas, mantas, decoração |
