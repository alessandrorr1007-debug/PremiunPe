-- ==============================================================================
-- SCHEMA DE BASE DE DATOS SUPABASE - PREMIUMPE
-- ==============================================================================
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase (https://app.supabase.com)

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PRODUCTOS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Streaming', 'Herramientas', 'IA')),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    delivery_type TEXT NOT NULL DEFAULT 'perfil' CHECK (delivery_type IN ('perfil', 'activacion_tu_cuenta', 'cuenta_entregada')),
    includes JSONB NOT NULL DEFAULT '[]'::jsonb,
    accent TEXT NOT NULL DEFAULT 'rocoto' CHECK (accent IN ('rocoto', 'lime', 'aji')),
    available BOOLEAN NOT NULL DEFAULT true,
    visible BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si la tabla ya existía de versiones anteriores, garantizar las columnas y check
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delivery_type TEXT NOT NULL DEFAULT 'perfil';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS includes JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS accent TEXT NOT NULL DEFAULT 'rocoto';
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE public.products ADD CONSTRAINT products_category_check CHECK (category IN ('Streaming', 'Herramientas', 'IA'));

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_products_updated_at ON public.products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 3. TABLA DE CONFIGURACIÓN GLOBAL (Fila única garantizada)
CREATE TABLE IF NOT EXISTS public.settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    whatsapp_number TEXT NOT NULL DEFAULT '51942990279',
    store_name TEXT NOT NULL DEFAULT 'PremiumPe',
    hero_badge TEXT DEFAULT 'Perú Express',
    hero_title TEXT NOT NULL DEFAULT 'Tus plataformas favoritas, al precio justo',
    hero_subtitle TEXT NOT NULL DEFAULT 'Elige, combina y pide por WhatsApp en minutos.',
    support_hours TEXT DEFAULT NULL,
    response_time TEXT DEFAULT NULL,
    payment_methods TEXT NOT NULL DEFAULT 'Yape y Plin',
    warranty_text TEXT DEFAULT NULL,
    currency TEXT NOT NULL DEFAULT 'S/',
    faq JSONB NOT NULL DEFAULT '[
        {
            "question": "¿Cómo me entregan la cuenta una vez que realizo el pago?",
            "answer": "Al enviar tu comprobante de pago por WhatsApp con tu pedido, se te envían los accesos correspondientes o se activa el servicio en tu cuenta según el tipo de entrega."
        },
        {
            "question": "¿Puedo renovar el mismo servicio para el siguiente periodo?",
            "answer": "Sí, coordinamos contigo antes del vencimiento para que puedas renovar y conservar tus configuraciones y listas sin inconvenientes."
        },
        {
            "question": "¿Cuáles son los métodos de pago aceptados?",
            "answer": "Aceptamos pagos a través de Yape y Plin de manera rápida y sin comisiones adicionales."
        },
        {
            "question": "¿Cómo funciona la reposición y garantía?",
            "answer": "Cada servicio cuenta con reposición prioritaria según los términos acordados si ocurre alguna eventualidad técnica durante tu periodo contratado."
        }
    ]'::jsonb,
    social_links JSONB NOT NULL DEFAULT '{
        "instagram": "https://instagram.com/premiumpe",
        "tiktok": "https://tiktok.com/@premiumpe",
        "facebook": "https://facebook.com/premiumpe"
    }'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Si la tabla ya existía, añadir las columnas nuevas
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_badge TEXT DEFAULT 'Perú Express';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS support_hours TEXT DEFAULT NULL;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS response_time TEXT DEFAULT NULL;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS payment_methods TEXT NOT NULL DEFAULT 'Yape y Plin';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS warranty_text TEXT DEFAULT NULL;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS faq JSONB NOT NULL DEFAULT '[]'::jsonb;

DROP TRIGGER IF EXISTS trigger_settings_updated_at ON public.settings;
CREATE TRIGGER trigger_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insertar configuración inicial por defecto (si no existe)
INSERT INTO public.settings (id, whatsapp_number, store_name, hero_badge, hero_title, hero_subtitle, support_hours, response_time, payment_methods, warranty_text, currency, faq, social_links)
VALUES (
    1,
    '51942990279',
    'PremiumPe',
    'Perú Express',
    'Tus plataformas favoritas, al precio justo',
    'Elige, combina y pide por WhatsApp en minutos.',
    'Atención por WhatsApp',
    'Respuesta por orden de llegada',
    'Yape y Plin',
    'Reposición y soporte activo durante todo el periodo contratado',
    'S/',
    '[
        {
            "question": "¿Cómo me entregan la cuenta una vez que realizo el pago?",
            "answer": "Al enviar tu comprobante de pago por WhatsApp con tu pedido, se te envían los accesos correspondientes o se activa el servicio en tu cuenta según el tipo de entrega."
        },
        {
            "question": "¿Puedo renovar el mismo servicio para el siguiente periodo?",
            "answer": "Sí, coordinamos contigo antes del vencimiento para que puedas renovar y conservar tus configuraciones y listas sin inconvenientes."
        },
        {
            "question": "¿Cuáles son los métodos de pago aceptados?",
            "answer": "Aceptamos pagos a través de Yape y Plin de manera rápida y sin comisiones adicionales."
        },
        {
            "question": "¿Cómo funciona la reposición y garantía?",
            "answer": "Cada servicio cuenta con reposición prioritaria según los términos acordados si ocurre alguna eventualidad técnica durante tu periodo contratado."
        }
    ]'::jsonb,
    '{
        "instagram": "https://instagram.com/premiumpe",
        "tiktok": "https://tiktok.com/@premiumpe",
        "facebook": "https://facebook.com/premiumpe"
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 4. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Políticas para PRODUCTS:
DROP POLICY IF EXISTS "Public can view visible products" ON public.products;
CREATE POLICY "Public can view visible products"
    ON public.products
    FOR SELECT
    USING (
        visible = true 
        OR (auth.role() = 'authenticated' AND (auth.jwt() ->> 'email') = 'admin@premiumpe.com')
    );

DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
CREATE POLICY "Admin can insert products"
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK ((auth.jwt() ->> 'email') = 'admin@premiumpe.com');

DROP POLICY IF EXISTS "Admin can update products" ON public.products;
CREATE POLICY "Admin can update products"
    ON public.products
    FOR UPDATE
    TO authenticated
    USING ((auth.jwt() ->> 'email') = 'admin@premiumpe.com')
    WITH CHECK ((auth.jwt() ->> 'email') = 'admin@premiumpe.com');

DROP POLICY IF EXISTS "Admin can delete products" ON public.products;
CREATE POLICY "Admin can delete products"
    ON public.products
    FOR DELETE
    TO authenticated
    USING ((auth.jwt() ->> 'email') = 'admin@premiumpe.com');

-- Políticas para SETTINGS:
DROP POLICY IF EXISTS "Public can view settings" ON public.settings;
CREATE POLICY "Public can view settings"
    ON public.settings
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admin can update settings" ON public.settings;
CREATE POLICY "Admin can update settings"
    ON public.settings
    FOR UPDATE
    TO authenticated
    USING ((auth.jwt() ->> 'email') = 'admin@premiumpe.com')
    WITH CHECK ((auth.jwt() ->> 'email') = 'admin@premiumpe.com');

DROP POLICY IF EXISTS "Admin can insert settings" ON public.settings;
CREATE POLICY "Admin can insert settings"
    ON public.settings
    FOR INSERT
    TO authenticated
    WITH CHECK ((auth.jwt() ->> 'email') = 'admin@premiumpe.com');

-- 5. BUCKET DE STORAGE PARA IMÁGENES DE PRODUCTOS
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
CREATE POLICY "Admin can upload product images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'product-images' 
        AND (auth.jwt() ->> 'email') = 'admin@premiumpe.com'
    );

DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
CREATE POLICY "Admin can update product images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'product-images' 
        AND (auth.jwt() ->> 'email') = 'admin@premiumpe.com'
    );

DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
CREATE POLICY "Admin can delete product images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'product-images' 
        AND (auth.jwt() ->> 'email') = 'admin@premiumpe.com'
    );

DO $$
DECLARE
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY ARRAY['products', 'settings'] LOOP
        IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
           AND NOT EXISTS (
               SELECT 1 FROM pg_publication_tables
               WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = table_name
           ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
        END IF;
    END LOOP;
END $$;
