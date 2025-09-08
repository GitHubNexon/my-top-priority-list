import Ionicons from "@react-native-vector-icons/ionicons";
import { IconProps } from "../types/IconProps";

const PlusIcon = ({ size, color }: IconProps) => (
    <Ionicons name="add-circle" size={size} color={color} />
);

export default PlusIcon;