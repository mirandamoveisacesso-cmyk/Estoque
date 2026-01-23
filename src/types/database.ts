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
            products: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    description: string | null;
                    price: number;
                    discount_price: number | null;
                    image_url: string | null;
                    is_active: boolean;
                    is_featured: boolean;
                    created_at: string;
                    updated_at: string;

                    // New columns
                    category: string | null;
                    sector: string | null;
                    stock_quantity: number;
                    colors: string | null;
                    models: string | null;
                    dimensions: string | null;
                    is_kit: boolean;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    description?: string | null;
                    price: number;
                    discount_price?: number | null;
                    image_url?: string | null;
                    is_active?: boolean;
                    is_featured?: boolean;
                    created_at?: string;
                    updated_at?: string;

                    category?: string | null;
                    sector?: string | null;
                    stock_quantity?: number;
                    colors?: string | null;
                    models?: string | null;
                    dimensions?: string | null;
                    is_kit?: boolean;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    description?: string | null;
                    price?: number;
                    discount_price?: number | null;
                    image_url?: string | null;
                    is_active?: boolean;
                    is_featured?: boolean;
                    created_at?: string;
                    updated_at?: string;

                    category?: string | null;
                    sector?: string | null;
                    stock_quantity?: number;
                    colors?: string | null;
                    models?: string | null;
                    dimensions?: string | null;
                    is_kit?: boolean;
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

export type Product = Tables<"products">;
export type ProductInsert = InsertDTO<"products">;
export type ProductUpdate = UpdateDTO<"products">;
