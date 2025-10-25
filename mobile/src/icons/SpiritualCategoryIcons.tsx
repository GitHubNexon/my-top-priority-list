import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { IconProps } from "../types/IconProps";
import Ionicons from "@react-native-vector-icons/ionicons";
import MaterialIcons from "@react-native-vector-icons/material-icons";

/**
 * A collection of reusable icons
 * for Spiritual Category
 */
const SpiritualCategoryIcons = ({ icon, size, color, enableFill = false }: IconProps) => {
    switch (icon) {
        case 'exploration':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'map-marker' : 'map-marker-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'hiking':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'hiking' : 'hiking'}
                    size={size}
                    color={color}
                />
            );
        case 'star-gazing':
            return (
                <Ionicons
                    name={enableFill ? 'telescope' : 'telescope-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'pray':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'hands-pray' : 'hands-pray'}
                    size={size}
                    color={color}
                />
            );
        case 'meditation':
            return (
                <MaterialIcons
                    name={enableFill ? 'self-improvement' : 'self-improvement'}
                    size={size}
                    color={color}
                />
            );
        case 'journaling':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'fountain-pen-tip' : 'fountain-pen-tip'}
                    size={size}
                    color={color}
                />
            );
        case 'other-outdoor-activities':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'dots-horizontal-circle'
                        : 'dots-horizontal-circle-outline'}
                    size={size}
                    color={color}
                />
            );
        default:
            return null;
    };
};

export default SpiritualCategoryIcons;