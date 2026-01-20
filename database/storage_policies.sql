-- =============================================
-- SUPABASE STORAGE - BUCKET E POLÍTICAS RLS
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Criar bucket para produtos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para permitir leitura pública
CREATE POLICY "Imagens públicas para leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- 3. Política para permitir upload por qualquer usuário autenticado
CREATE POLICY "Usuários autenticados podem fazer upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products');

-- 4. Política para permitir atualização
CREATE POLICY "Usuários autenticados podem atualizar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products');

-- 5. Política para permitir deleção
CREATE POLICY "Usuários autenticados podem deletar"
ON storage.objects FOR DELETE
USING (bucket_id = 'products');

-- =============================================
-- ALTERNATIVA: Políticas mais permissivas (para desenvolvimento)
-- Use estas se as acima não funcionarem
-- =============================================

-- DROP POLICY IF EXISTS "Imagens públicas para leitura" ON storage.objects;
-- DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload" ON storage.objects;
-- DROP POLICY IF EXISTS "Usuários autenticados podem atualizar" ON storage.objects;
-- DROP POLICY IF EXISTS "Usuários autenticados podem deletar" ON storage.objects;

-- Política que permite tudo para o bucket products
-- CREATE POLICY "Allow all for products bucket"
-- ON storage.objects
-- FOR ALL
-- USING (bucket_id = 'products')
-- WITH CHECK (bucket_id = 'products');
