import Ionicons from "@react-native-vector-icons/ionicons";
import { IconProps } from "../types/IconProps";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import Fontisto from "@react-native-vector-icons/fontisto";
import AntDesign from "@react-native-vector-icons/ant-design";

/**
 * A collection of reusable icons
 * for Health Category
 */
const HealthCategoryIcons = ({ icon, size, color, enableFill = false }: IconProps) => {
    switch (icon) {
        case 'rest':
            return (
                <Ionicons
                    name={enableFill ? 'bed' : 'bed-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'exercise':
            return (
                <Ionicons
                    name={enableFill ? 'barbell' : 'barbell-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'diet':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'food-off' : 'food-off-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'medicine':
            return (
                <Fontisto
                    name={enableFill ? 'pills' : 'pills'}
                    size={size}
                    color={color}
                />
            );
        case 'therapy':
            return (
                <AntDesign
                    name={enableFill ? 'heart' : "heart"}
                    size={size}
                    color={color}
                />
            );
        case 'self-care':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'hand-heart' : 'hand-heart-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'document':
            return (
                <Ionicons
                    name={enableFill ? 'document-text' : 'document-text-outline'}
                    size={size}
                    color={color}
                />
            );
        default:
            return null;
    };
};

export default HealthCategoryIcons;