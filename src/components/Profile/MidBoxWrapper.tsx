import React from 'react';
import {
    Dimensions,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { WrapperProps } from '../../types/WrapperProps';

export const MidBoxWrapper = ({ children, style, onPress }: WrapperProps) => {
    const { width, height } = Dimensions.get('window');

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.midBoxContainer,
            style, {
            width: width * .93,
            height: height * .07,
        }]}>
            {children}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    midBoxContainer: {
        marginTop: 2,
        borderRadius: 8,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
});