import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface ColorTheme {
  id: string;
  name: string;
  emoji: string;
  colors: {
    primary: string;      // Background principal
    secondary: string;    // Destaques e bordas
    accent: string;       // Botões CTA
    text: string;         // Texto principal
    textMuted: string;    // Texto secundário
    cardBg: string;       // Background de cards
  };
}

// Paletas de cores disponíveis
export const COLOR_THEMES: ColorTheme[] = [
  {
    id: "lovely-rose",
    name: "Lovely Rose",
    emoji: "🌹",
    colors: {
      primary: "#3e1126",
      secondary: "#ea9fc2",
      accent: "#d58124",
      text: "#ffffff",
      textMuted: "rgba(255, 255, 255, 0.7)",
      cardBg: "rgba(234, 159, 194, 0.08)",
    },
  },
  {
    id: "pure-white",
    name: "Rosa Claro",
    emoji: "🌸",
    colors: {
      primary: "#fff5f8",
      secondary: "#d4749a",
      accent: "#c4692b",
      text: "#3e1126",
      textMuted: "rgba(62, 17, 38, 0.6)",
      cardBg: "#ffffff",
    },
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    emoji: "🌙",
    colors: {
      primary: "#1a1b3c",
      secondary: "#7c9cbf",
      accent: "#e8a838",
      text: "#ffffff",
      textMuted: "rgba(255, 255, 255, 0.7)",
      cardBg: "rgba(124, 156, 191, 0.08)",
    },
  },
  {
    id: "forest-green",
    name: "Forest Green",
    emoji: "🌲",
    colors: {
      primary: "#1a2e1a",
      secondary: "#8fbc8f",
      accent: "#d4a373",
      text: "#ffffff",
      textMuted: "rgba(255, 255, 255, 0.7)",
      cardBg: "rgba(143, 188, 143, 0.08)",
    },
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    emoji: "🌅",
    colors: {
      primary: "#2d1f1a",
      secondary: "#e8a87c",
      accent: "#c4574b",
      text: "#ffffff",
      textMuted: "rgba(255, 255, 255, 0.7)",
      cardBg: "rgba(232, 168, 124, 0.08)",
    },
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    emoji: "👑",
    colors: {
      primary: "#2d1f3d",
      secondary: "#b19cd9",
      accent: "#e8a838",
      text: "#ffffff",
      textMuted: "rgba(255, 255, 255, 0.7)",
      cardBg: "rgba(177, 156, 217, 0.08)",
    },
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    emoji: "🌊",
    colors: {
      primary: "#1a2d2d",
      secondary: "#7ec8c8",
      accent: "#e8a838",
      text: "#ffffff",
      textMuted: "rgba(255, 255, 255, 0.7)",
      cardBg: "rgba(126, 200, 200, 0.08)",
    },
  },
];

interface ThemeContextType {
  currentTheme: ColorTheme;
  setTheme: (themeId: string) => void;
  themes: ColorTheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "lovely_theme";
const DEFAULT_THEME_ID = "pure-white";

function applyThemeToDOM(theme: ColorTheme) {
  const root = document.documentElement;
  
  root.style.setProperty("--lovely-primary", theme.colors.primary);
  root.style.setProperty("--lovely-secondary", theme.colors.secondary);
  root.style.setProperty("--lovely-accent", theme.colors.accent);
  root.style.setProperty("--lovely-text", theme.colors.text);
  root.style.setProperty("--lovely-text-muted", theme.colors.textMuted);
  root.style.setProperty("--lovely-white", theme.colors.text); // Texto principal
  root.style.setProperty("--lovely-card-bg", theme.colors.cardBg);
  
  // Atualizar também as variáveis base
  root.style.setProperty("--background", theme.colors.primary);
  root.style.setProperty("--foreground", theme.colors.text);
  root.style.setProperty("--primary", theme.colors.accent);
  root.style.setProperty("--secondary", theme.colors.secondary);
  root.style.setProperty("--card", theme.colors.cardBg);
  root.style.setProperty("--card-foreground", theme.colors.text);
  
  // Atualizar cor de fundo do body
  document.body.style.backgroundColor = theme.colors.primary;
  document.body.style.color = theme.colors.text;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(
    COLOR_THEMES.find((t) => t.id === DEFAULT_THEME_ID) || COLOR_THEMES[0]
  );

  // Carregar tema do localStorage
  useEffect(() => {
    const storedThemeId = localStorage.getItem(STORAGE_KEY);
    if (storedThemeId) {
      const theme = COLOR_THEMES.find((t) => t.id === storedThemeId);
      if (theme) {
        setCurrentTheme(theme);
        applyThemeToDOM(theme);
      }
    } else {
      applyThemeToDOM(currentTheme);
    }
  }, []);

  const setTheme = useCallback((themeId: string) => {
    const theme = COLOR_THEMES.find((t) => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem(STORAGE_KEY, themeId);
      applyThemeToDOM(theme);
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{ currentTheme, setTheme, themes: COLOR_THEMES }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
