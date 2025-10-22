import React from 'react';
import {
    Dimensions,
    StyleSheet,
    View,
} from 'react-native';
import { WrapperProps } from '../../types/WrapperProps';
import Feather from '@react-native-vector-icons/feather';
import { useTheme } from '../../hooks';

export const EditIcon = ({ style }: WrapperProps) => {
    const { theme } = useTheme();

    const { width } = Dimensions.get('window');
    const analogousThemColor = theme.myColors?.analogous;

    return (
        <View style={[styles.editIconContainer, style]}>
            <Feather
                name='edit'
                color={analogousThemColor}
                size={width * .046}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    editIconContainer: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center'
    },
});