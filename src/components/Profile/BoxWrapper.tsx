import React from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import { WrapperProps } from '../../types/WrapperProps';

export const BoxWrapper = ({ children, style }: WrapperProps) => {
    return (
        <View style={[styles.boxContainer, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    boxContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    }
});