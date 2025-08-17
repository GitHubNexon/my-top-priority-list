import AntDesign from "@react-native-vector-icons/ant-design";
import FontAwesome5 from "@react-native-vector-icons/fontawesome5";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import Fontisto from "@react-native-vector-icons/fontisto";
import Ionicons from "@react-native-vector-icons/ionicons";
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { StyleProp, TextStyle } from "react-native";

type Props = {
    style?: StyleProp<TextStyle>;
    icon?: string;
    size?: number;
    color?: string;
    enableFill?: boolean;
};

export const PlusIcon = ({ size, color }: Props) => (
    <Ionicons name="add-circle" size={size} color={color} />
);

//Dropdown Category Icon
export const CategoryLeftIcon = ({ style, size, color }: Props) => (
    <Ionicons name="list-outline" style={style} size={size} color={color} />
);

export const CategoryRightIcon = ({ style, size, color }: Props) => (
    <AntDesign name="down-circle" style={style} size={size} color={color} />
);

/**
 * A collection of reusable icons
 * for notes main category
 */
export const NotesCategoryIcon = ({ icon, size, color, enableFill = true }: Props) => {
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

/**
 * A collection of reusable icons
 * for Type of Notes
 */
export const NotesTypeIcon = ({ icon, size, color, enableFill = false }: Props) => {
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

/**
 * A collection of reusable icons
 * for Work Category
 */
export const WorkCategoryIcon = ({ icon, size, color, enableFill = false }: Props) => {
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

/**
 * A collection of reusable icons
 * for Health Category
 */
export const HealthCategoryIcon = ({ icon, size, color, enableFill = false }: Props) => {
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

/**
 * A collection of reusable icons
 * for Spiritual Category
 */
export const SpiritualCategoryIcon = ({ icon, size, color, enableFill = false }: Props) => {
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
                <FontAwesome5 name='pen-nib' iconStyle='solid'/>
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

/**
 * A collection of reusable icons
 * for Finance Category
 */
export const FinanceCategoryIcon = ({ icon, size, color, enableFill = false }: Props) => {
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
                <FontAwesome6 name='sack-dollar' iconStyle='solid' />
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

/**
 * A collection of reusable icons
 * for Hobby Category
 */
export const HobbyCategoryIcon = ({ icon, size, color, enableFill = false }: Props) => {
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