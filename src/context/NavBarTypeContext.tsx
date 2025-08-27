import React, { createContext, PropsWithChildren, useEffect, useState } from 'react'
import { NativeModules, Platform } from 'react-native';

type navBarContextType = {
    navigationType: string | null;
};

export const NavBarTypeContext = createContext<navBarContextType>({
    navigationType: null,
});

const NavBarTypeProvider = ({children}: PropsWithChildren) => {
    const [navigationType, setNavigationType] = useState<string | null>(null);

    const { AndroidNavigation } = NativeModules;

    const checkAndroidNavigationType = async (): Promise<'3-button' | '2-button' | 'gesture' | null> => {
        if (Platform.OS === 'android') {
            try {
                const navType: '3-button' | '2-button' | 'gesture' = await AndroidNavigation.getNavigationMode();
                return navType;
            } catch {
                return '3-button'; // fallback
            }
        }
        return null;
    };

    useEffect(() => {
        const navigation = async () => {
            const navType = await checkAndroidNavigationType();
            setNavigationType(navType);
        };

        navigation();
    }, []);

  return (
    <NavBarTypeContext.Provider
          value={{navigationType}}
    >
        {children}
    </NavBarTypeContext.Provider>
  )
};

export default NavBarTypeProvider;