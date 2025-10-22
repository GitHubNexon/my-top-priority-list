import React from 'react';
import {
    Dimensions,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { WrapperProps } from '../../types/WrapperProps';

export const BottomBoxWrapper = ({ children, style, onPress }: WrapperProps) => {
    const { width, height } = Dimensions.get('window');

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.bottomBoxContainer, style, {
            width: width * .93,
            height: height * .07,
        }]}>
            {children}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    bottomBoxContainer: {
        marginTop: 2,
        borderTopRightRadius: 8,
        borderTopLeftRadius: 8,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
});