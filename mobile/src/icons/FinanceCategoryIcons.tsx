import Ionicons from "@react-native-vector-icons/ionicons";
import { IconProps } from "../types/IconProps";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

/**
 * A collection of reusable icons
 * for Finance Category
 */
const FinanceCategoryIcons = ({ icon, size, color, enableFill = false }: IconProps) => {
    switch (icon) {
        case 'expenses':
            return (
                <Ionicons
                    name={enableFill ? 'receipt' : 'receipt-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'budget':
            return (
                <MaterialIcons
                    name={enableFill ? 'attach-money' : 'attach-money'}
                    size={size}
                    color={color}
                />
            );
        case 'miscellaneous':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'shopping' : 'shopping-outline'}
                    size={size}
                    color={color}
                />
            );
        default:
            return null;
    }
};

export default FinanceCategoryIcons;