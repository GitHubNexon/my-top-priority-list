import Ionicons from '@react-native-vector-icons/ionicons';
import { JSX } from 'react';

type IconProps = {
    color: string;
    size: number;
    isFocused?: boolean;
};

const BottomTabIcons: Record<string, (props: IconProps) => JSX.Element> = {
    Profile: (props) => {
        const { isFocused } = props;

        return (
            <Ionicons name={isFocused ? 'person-circle' : 'person-circle-outline'} {...props} />
        )
    },
    NoteList: (props) => {
        const { isFocused } = props;

        return (
            <Ionicons name={isFocused ? 'list-circle' : 'list-circle-outline'} {...props} />
        )
    },
    Priorities: (props) => {
        const { isFocused } = props;

        return (
            <Ionicons name={isFocused ? 'home' : 'home-outline'} {...props} />
        )
    },
    Calendar: (props) => {
        const { isFocused } = props;

        return (
            <Ionicons name={isFocused ? 'calendar-number' : 'calendar-number-outline'} {...props} />
        )
    },
    Chart: (props) => {
        const { isFocused } = props;

        return (
            <Ionicons name={isFocused ? 'pie-chart' : 'pie-chart-outline'} {...props} />
        )
    }
};

export default BottomTabIcons;