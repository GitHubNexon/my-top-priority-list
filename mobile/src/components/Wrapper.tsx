import React from 'react';
import {
    Dimensions,
    StyleSheet,
    View,
} from 'react-native';
import { WrapperProps } from '../types/WrapperProps';

export const BottomSheetWrapper = ({ children, style }: WrapperProps) => {
    const { width } = Dimensions.get('window');

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
