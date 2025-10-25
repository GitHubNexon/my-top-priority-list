import React, {
    createContext,
    useState,
    useMemo,
} from 'react';
import { useColorScheme } from 'react-native';
import {
    CustomTheme,
    ThemeFamily,
    ThemeMode,
    Themes,
} from '../theme';

interface ThemeContextType {
    theme: CustomTheme;
    family: ThemeFamily;
    mode: ThemeMode | 'system';
    setFamily: (family: ThemeFamily) => void;
    setMode: (mode: ThemeMode | 'system') => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: Themes.default.light,
    family: 'default',
    mode: 'system',
    setFamily: () => { },
    setMode: () => { },
});

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useColorScheme();
    const [family, setFamily] = useState<ThemeFamily>('default');
    const [mode, setMode] = useState<ThemeMode | 'system'>('system');

    const theme = useMemo(() => {
        const resolvedMode: ThemeMode =
            mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
        return Themes[family][resolvedMode];
    }, [family, mode, systemScheme]);

    return (
        <ThemeContext.Provider value={{
            theme,
            family,
            mode,
            setFamily,
            setMode
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;