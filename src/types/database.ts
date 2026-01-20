// Types gerados a partir do schema do Supabase
// Representa a estrutura do banco de dados para Miranda Móveis

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    password_hash: string;
                    name: string | null;
                    role: string;
                    avatar_url: string | null;
                    is_active: boolean;
                    last_login_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    password_hash: string;
                    name?: string | null;
                    role?: string;
                    avatar_url?: string | null;
                    is_active?: boolean;
                    last_login_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    password_hash?: string;
                    name?: string | null;
                    role?: string;
                    avatar_url?: string | null;
                    is_active?: boolean;
                    last_login_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            categories: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    image_url: string | null;
                    display_order: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    description?: string | null;
                    image_url?: string | null;
                    display_order?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    description?: string | null;
                    image_url?: string | null;
                    display_order?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            materials: {
                Row: {
                    id: string;
                    name: string;
                    type: string;
                    hex_code: string | null;
                    description: string | null;
                    is_custom: boolean;
                    display_order: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    type: string;
                    hex_code?: string | null;
                    description?: string | null;
                    is_custom?: boolean;
                    display_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    type?: string;
                    hex_code?: string | null;
                    description?: string | null;
                    is_custom?: boolean;
                    display_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            dimensions: {
                Row: {
                    id: string;
                    name: string;
                    width_cm: number | null;
                    height_cm: number | null;
                    depth_cm: number | null;
                    display_order: number;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    width_cm?: number | null;
                    height_cm?: number | null;
                    depth_cm?: number | null;
                    display_order?: number;
                    is_active?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    width_cm?: number | null;
                    height_cm?: number | null;
                    depth_cm?: number | null;
                    display_order?: number;
                    is_active?: boolean;
                    created_at?: string;
                };
            };
            products: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    price: number;
                    discount_price: number | null;
                    category_id: string;
                    image_url: string | null;
                    weight_kg: number | null;
                    warranty_months: number | null;
                    assembly_required: boolean;
                    is_active: boolean;
                    is_featured: boolean;
                    stock_status: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    description?: string | null;
                    price: number;
                    discount_price?: number | null;
                    category_id: string;
                    image_url?: string | null;
                    weight_kg?: number | null;
                    warranty_months?: number | null;
                    assembly_required?: boolean;
                    is_active?: boolean;
                    is_featured?: boolean;
                    stock_status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    description?: string | null;
                    price?: number;
                    discount_price?: number | null;
                    category_id?: string;
                    image_url?: string | null;
                    weight_kg?: number | null;
                    warranty_months?: number | null;
                    assembly_required?: boolean;
                    is_active?: boolean;
                    is_featured?: boolean;
                    stock_status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            product_dimensions: {
                Row: {
                    id: string;
                    product_id: string;
                    dimension_id: string;
                    custom_width_cm: number | null;
                    custom_height_cm: number | null;
                    custom_depth_cm: number | null;
                    price_adjustment: number | null;
                    stock_quantity: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    product_id: string;
                    dimension_id: string;
                    custom_width_cm?: number | null;
                    custom_height_cm?: number | null;
                    custom_depth_cm?: number | null;
                    price_adjustment?: number | null;
                    stock_quantity?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    product_id?: string;
                    dimension_id?: string;
                    custom_width_cm?: number | null;
                    custom_height_cm?: number | null;
                    custom_depth_cm?: number | null;
                    price_adjustment?: number | null;
                    stock_quantity?: number;
                    created_at?: string;
                };
            };
            product_materials: {
                Row: {
                    id: string;
                    product_id: string;
                    material_id: string;
                    image_url: string | null;
                    price_adjustment: number | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    product_id: string;
                    material_id: string;
                    image_url?: string | null;
                    price_adjustment?: number | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    product_id?: string;
                    material_id?: string;
                    image_url?: string | null;
                    price_adjustment?: number | null;
                    created_at?: string;
                };
            };
            product_images: {
                Row: {
                    id: string;
                    product_id: string;
                    image_url: string;
                    alt_text: string | null;
                    display_order: number;
                    is_primary: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    product_id: string;
                    image_url: string;
                    alt_text?: string | null;
                    display_order?: number;
                    is_primary?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    product_id?: string;
                    image_url?: string;
                    alt_text?: string | null;
                    display_order?: number;
                    is_primary?: boolean;
                    created_at?: string;
                };
            };
            user_settings: {
                Row: {
                    id: string;
                    user_id: string;
                    theme_id: string;
                    language: string;
                    notifications_enabled: boolean;
                    catalog_view_mode: string;
                    settings_json: Record<string, unknown>;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    theme_id?: string;
                    language?: string;
                    notifications_enabled?: boolean;
                    catalog_view_mode?: string;
                    settings_json?: Record<string, unknown>;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    theme_id?: string;
                    language?: string;
                    notifications_enabled?: boolean;
                    catalog_view_mode?: string;
                    settings_json?: Record<string, unknown>;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}

// Helper types para uso no código
export type Tables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Row"];

export type InsertDTO<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Insert"];

export type UpdateDTO<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Update"];

// Aliases para facilitar uso
export type Category = Tables<"categories">;
export type CategoryInsert = InsertDTO<"categories">;
export type CategoryUpdate = UpdateDTO<"categories">;

export type Material = Tables<"materials">;
export type MaterialInsert = InsertDTO<"materials">;
export type MaterialUpdate = UpdateDTO<"materials">;

export type Dimension = Tables<"dimensions">;
export type DimensionInsert = InsertDTO<"dimensions">;

export type Product = Tables<"products">;
export type ProductInsert = InsertDTO<"products">;
export type ProductUpdate = UpdateDTO<"products">;

export type ProductDimension = Tables<"product_dimensions">;
export type ProductMaterial = Tables<"product_materials">;
export type ProductImage = Tables<"product_images">;

// Produto com relacionamentos expandidos
export interface ProductWithRelations extends Product {
    category?: Category;
    dimensions?: Dimension[];
    materials?: Material[];
    images?: ProductImage[];
}
