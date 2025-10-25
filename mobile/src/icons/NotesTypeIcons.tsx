import Ionicons from "@react-native-vector-icons/ionicons";
import { IconProps } from "../types/IconProps";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import MaterialIcons from "@react-native-vector-icons/material-icons";

/**
 * A collection of reusable icons
 * for Type of Notes
 */
const NotesTypeIcons = ({ icon, size, color, enableFill = false }: IconProps) => {
    switch (icon) {
        case 'priority':
            return (
                <Ionicons
                    name={enableFill ? 'star' : 'star-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'quick-note':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'note-text' : 'note-text-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'daily':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'clipboard-clock' : 'clipboard-clock-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'to-do':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'check-circle' : 'check-circle-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'reminder':
            return (
                <Ionicons
                    name={enableFill ? 'notifications' : 'notifications-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'important':
            return (
                <MaterialIcons
                    name={enableFill ? 'label-important' : 'label-important-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'archive':
            return (
                <Ionicons
                    name={enableFill ? 'archive' : 'archive-outline'}
                    size={size}
                    color={color}
                />
            );
        default:
            return null;
    };
};

export default NotesTypeIcons;