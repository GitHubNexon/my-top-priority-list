import Ionicons from "@react-native-vector-icons/ionicons";
import { IconProps } from "../types/IconProps";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import MaterialIcons from "@react-native-vector-icons/material-icons";

/**
 * A collection of reusable icons
 * for Hobby Category
 */
const HobbyCategoryIcons = ({ icon, size, color, enableFill = false }: IconProps) => {
    switch (icon) {
        case 'watchlist':
            return (
                <Ionicons
                    name={enableFill ? 'tv' : 'tv-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'books':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'book-open' : 'book-open-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'music':
            return (
                <Ionicons
                    name={enableFill ? 'musical-notes' : 'musical-notes-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'learning':
            return (
                <Ionicons
                    name={enableFill ? 'school' : 'school-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'diy':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'tools' : 'tools'}
                    size={size}
                    color={color}
                />
            );
        case 'e-games':
            return (
                <Ionicons
                    name={enableFill ? 'game-controller'
                        : 'game-controller-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'toys':
            return (
                <MaterialIcons
                    name={enableFill ? 'toys' : 'toys'}
                    size={size}
                    color={color}
                />
            );
        case 'photography':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'camera-iris' : 'camera-iris'}
                    size={size}
                    color={color}
                />
            );
        case 'sports':
            return (
                <Ionicons
                    name={enableFill ? 'basketball' : 'basketball-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'other':
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
    }
};

export default HobbyCategoryIcons;