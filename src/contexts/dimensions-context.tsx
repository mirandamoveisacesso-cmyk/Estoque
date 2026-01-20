import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { dimensionsService } from "@/services/dimensions.service";
import type { Dimension } from "@/types/product";

interface DimensionsContextValue {
    dimensions: Dimension[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

const DimensionsContext = createContext<DimensionsContextValue | undefined>(
    undefined
);

export function DimensionsProvider({ children }: { children: ReactNode }) {
    const [dimensions, setDimensions] = useState<Dimension[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDimensions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await dimensionsService.getAll();
            setDimensions(data);
        } catch (err) {
            console.error("Erro ao carregar dimensões:", err);
            setError("Erro ao carregar dimensões");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDimensions();
    }, []);

    return (
        <DimensionsContext.Provider
            value={{
                dimensions,
                isLoading,
                error,
                refresh: loadDimensions,
            }}
        >
            {children}
        </DimensionsContext.Provider>
    );
}

export function useDimensions() {
    const context = useContext(DimensionsContext);
    if (!context) {
        throw new Error(
            "useDimensions deve ser usado dentro de DimensionsProvider"
        );
    }
    return context;
}
