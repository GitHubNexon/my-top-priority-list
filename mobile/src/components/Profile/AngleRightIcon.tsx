import React from 'react';
import {
    Dimensions,
    StyleSheet,
    View,
} from 'react-native';
import { WrapperProps } from '../../types/WrapperProps';
import { useTheme } from '../../hooks';
import Fontisto from '@react-native-vector-icons/fontisto';

export const AngleRightIcon = ({ style }: WrapperProps) => {
    const { theme } = useTheme();

    const { width } = Dimensions.get('window');
    const analogousThemColor = theme.myColors?.analogous;

    return (
        <View style={[styles.angleRightIconContainer, style]}>
            <Fontisto
                name='angle-right'
                color={analogousThemColor}
                size={width * .046}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    angleRightIconContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
});