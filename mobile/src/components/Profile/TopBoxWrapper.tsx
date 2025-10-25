import React from 'react';
import {
    Dimensions,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { WrapperProps } from '../../types/WrapperProps';

export const TopBoxWrapper = ({ children, style, onPress }: WrapperProps) => {
    const { width, height } = Dimensions.get('window');

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.topBoxContainer, style, {
            width: width * .93,
            height: height * .07,
        }]}>
            {children}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    topBoxContainer: {
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 8,
        borderBottomLeftRadius: 8,
        padding: 16,
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
    }
});