import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";
import { IconProps } from "../types/IconProps";
import Ionicons from "@react-native-vector-icons/ionicons";

/**
 * A collection of reusable icons
 * for Work Category
 */
const WorkCategoryIcons = ({ icon, size, color, enableFill = false }: IconProps) => {
    switch (icon) {
        case 'meeting':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'account-group' : 'account-group-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'task':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'clipboard-check' : 'clipboard-check-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'project':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'folder-cog' : 'folder-cog-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'issue':
            return (
                <Ionicons
                    name={enableFill ? 'warning' : 'warning-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'idea':
            return (
                <MaterialDesignIcons
                    name={enableFill ? 'lightbulb-on' : 'lightbulb-on-outline'}
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
        case 'deadline':
            return (
                <Ionicons
                    name={enableFill ? 'today' : 'today-outline'}
                    size={size}
                    color={color}
                />
            );
        case 'feedback':
            return (
                <Ionicons
                    name={enableFill ? 'chatbubbles' : 'chatbubbles-outline'}
                    size={size}
                    color={color}
                />
            );
        default:
            return null;
    };
};

export default WorkCategoryIcons;