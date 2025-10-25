import Ionicons from "@react-native-vector-icons/ionicons";
import { IconProps } from "../types/IconProps";
import AntDesign from "@react-native-vector-icons/ant-design";

//Dropdown Category Icon
export const CategoryLeftIcon = ({ style, size, color }: IconProps) => (
    <Ionicons name="list-outline" style={style} size={size} color={color} />
);

export const CategoryRightIcon = ({ style, size, color }: IconProps) => (
    <AntDesign name="down-circle" style={style} size={size} color={color} />
);