import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { materialsService } from "@/services/materials.service";
import type { Material, MaterialType } from "@/types/product";

interface MaterialsContextValue {
    materials: Material[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    getMaterialsByType: (type: MaterialType) => Material[];
    addMaterial: (material: Omit<Material, "id">) => Promise<Material>;
    updateMaterial: (id: string, material: Partial<Material>) => Promise<Material>;
    deleteMaterial: (id: string) => Promise<void>;
}

const MaterialsContext = createContext<MaterialsContextValue | undefined>(
    undefined
);

export function MaterialsProvider({ children }: { children: ReactNode }) {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMaterials = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await materialsService.getAll();
            setMaterials(data);
        } catch (err) {
            console.error("Erro ao carregar materiais:", err);
            setError("Erro ao carregar materiais");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMaterials();
    }, []);

    const getMaterialsByType = (type: MaterialType): Material[] => {
        return materials.filter(m => m.type === type);
    };

    const addMaterial = async (material: Omit<Material, "id">): Promise<Material> => {
        const newMaterial = await materialsService.create(material);
        setMaterials(prev => [...prev, newMaterial]);
        return newMaterial;
    };

    const updateMaterial = async (id: string, material: Partial<Material>): Promise<Material> => {
        const updated = await materialsService.update(id, material);
        setMaterials(prev => prev.map(m => m.id === id ? updated : m));
        return updated;
    };

    const deleteMaterial = async (id: string): Promise<void> => {
        await materialsService.delete(id);
        setMaterials(prev => prev.filter(m => m.id !== id));
    };

    return (
        <MaterialsContext.Provider
            value={{
                materials,
                isLoading,
                error,
                refresh: loadMaterials,
                getMaterialsByType,
                addMaterial,
                updateMaterial,
                deleteMaterial,
            }}
        >
            {children}
        </MaterialsContext.Provider>
    );
}

export function useMaterials() {
    const context = useContext(MaterialsContext);
    if (!context) {
        throw new Error(
            "useMaterials deve ser usado dentro de MaterialsProvider"
        );
    }
    return context;
}
