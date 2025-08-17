import React from 'react';
import {
    StyleSheet,
    useWindowDimensions,
    View,
    ViewStyle,
} from 'react-native';

type BottomSheetWrapperProps = {
    children: React.ReactNode;
    style?: ViewStyle;
};

export const BottomSheetWrapper = ({ children, style }: BottomSheetWrapperProps) => {
    const { width } = useWindowDimensions();

    return (
        <View style={[styles.bottomSheetContainer, style]}>
            <View
                style={[
                    styles.bottomSheetContentContainer,
                    {
                        width: width - 80
                    }
                ]}
            >
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomSheetContainer: {
        width: '100%',
        height: 'auto',
        borderRadius: 30,
        backgroundColor: '#44AC61',
        overflow: 'hidden',
    },
    bottomSheetContentContainer: {
        width: 410,
        margin: 20,
        overflow: 'hidden',
    },
});
