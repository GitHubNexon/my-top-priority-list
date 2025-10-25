import MaterialIcons from "@react-native-vector-icons/material-icons";
import { IconProps } from "../types/IconProps";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

/**
 * A collection of reusable icons
 * for notes main category
 */
const NotesCategoryIcons = ({ icon, size, color, enableFill = true }: IconProps) => {
    switch (icon) {
        case 'work':
            return (
                <MaterialIcons
                    name={enableFill ? 'work' : 'work-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'health':
            return (
                <MaterialIcons
                    name={enableFill ? 'health-and-safety' : 'health-and-safety'}
                    size={size}
                    color={color}
                />
            );
        case 'spiritual':
            return (
                <MaterialIcons
                    name={enableFill ? 'self-improvement' : 'self-improvement'}
                    size={size}
                    color={color}
                />
            );
        case 'finance':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'finance' : 'finance'}
                    size={size}
                    color={color}
                />
            );
        case 'hobby':
            return (
                <MaterialIcons
                    name={enableFill ? 'interests' : 'interests'}
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
    };
};

export default NotesCategoryIcons;