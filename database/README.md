# 📊 Database Schema - Miranda Móveis

Este diretório contém toda a estrutura do banco de dados para o sistema de catálogo de móveis Miranda.

## 📁 Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `schema.sql` | Schema completo do banco de dados (DDL) |
| `seed.sql` | Dados iniciais para popular o banco |
| `diagram.md` | Diagrama ER em formato Mermaid |

## 🗂️ Tabelas

### Principais
- **users** - Usuários administradores do sistema
- **categories** - Categorias de móveis (Sofás, Mesas, Camas, etc.)
- **products** - Móveis do catálogo
- **materials** - Materiais disponíveis (madeiras, tecidos, metais, vidros)
- **dimensions** - Dimensões padrão (Compacto, Padrão, Grande, King)

### Junction Tables (N:N)
- **product_dimensions** - Dimensões disponíveis por produto
- **product_materials** - Materiais disponíveis por produto
- **product_images** - Galeria de imagens por produto

### Configurações
- **user_settings** - Preferências por usuário (tema, idioma, etc.)

## 🪵 Tipos de Materiais

| Tipo | Descrição |
|------|-----------|
| `wood` | Madeiras: Maciça, MDF, Compensado |
| `fabric` | Tecidos: Linho, Veludo, Couro, Suede |
| `metal` | Metais: Dourado, Cromado, Ferro |
| `glass` | Vidros: Temperado, Fumê, Espelhado |

## 📏 Dimensões

| Nome | Uso Típico |
|------|------------|
| Compacto | Apartamentos pequenos |
| Padrão | Uso geral |
| Grande | Ambientes amplos |
| King | Camas e sofás grandes |

## 🖼️ Armazenamento de Imagens

As imagens são armazenadas no **Cloudinary** como CDN. Os campos de imagem contêm apenas a URL.

## 🚀 Como usar

### 1. Criar o banco de dados
```bash
createdb miranda_moveis
```

### 2. Executar o schema
```bash
psql -d miranda_moveis -f schema.sql
```

### 3. Popular com dados iniciais
```bash
psql -d miranda_moveis -f seed.sql
```

## 📦 Supabase

Se estiver usando Supabase, execute os scripts SQL diretamente no **SQL Editor** do painel:

1. Primeiro execute `schema.sql`
2. Depois execute `seed.sql`

---

## 📐 Convenções

- **Primary Keys**: UUID v4 gerados automaticamente
- **Timestamps**: `created_at` e `updated_at` automáticos
- **Imagens**: URLs do Cloudinary
- **Slugs**: URLs amigáveis para SEO
- **Constraints**: Check constraints para validação
