import {
    CategoryLeftIcon,
    CategoryRightIcon,
    NotesTypeIcon,
} from "../constant/NotesIcons";
import { NoteType } from "../types/Notes";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const noteTypeList = [
    { label: 'Priority', value: 'Priority', icon: 'priority' },
    { label: 'Quick Note', value: 'Quick Note', icon: 'quick-note' },
    { label: 'Daily', value: 'Daily', icon: 'daily' },
    { label: 'To-Do', value: 'To-Do', icon: 'to-do' },
    { label: 'Reminder', value: 'Reminder', icon: 'reminder' },
    { label: 'Important', value: 'Important', icon: 'important' },
    { label: 'Archive', value: 'Archive', icon: 'archive' },
];

type Props = {
    value?: NoteType | null;
    onChangeItem?: (item: NoteType) => void;
};

const DropdownTypeofNotes = ({ value, onChangeItem }: Props) => {
    const [isFocus, setIsFocus] = useState(false);

    return (
        <Dropdown
            style={styles.dropdown}
            maxHeight={300}
            placeholderStyle={styles.placeholderStyle}
            placeholder={!isFocus ? 'Type of Notes' : 'Select a Type'}
            data={noteTypeList}
            value={value?.value ?? null} // Pass just the string value to match `valueField`
            valueField="value"
            labelField="label"
            selectedTextStyle={styles.selectedTextStyle}
            itemTextStyle={{ textAlign: 'left' }}
            itemContainerStyle={{ borderRadius: 20 }}
            containerStyle={{ borderRadius: 20 }}
            activeColor="#CFFFDC"
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={(item) => {
                setIsFocus(false);
                onChangeItem?.(item); // Notify parent
            }}
            renderLeftIcon={() => {
                const selectedItem = noteTypeList.find(d => d.value === value?.value);

                return selectedItem ? (
                    <NotesTypeIcon icon={selectedItem.icon} size={20} color="#2E6F40" />
                ) : (
                    <CategoryLeftIcon size={20} color="#2E6F40" />
                );
            }}
            renderRightIcon={() => (
                <CategoryRightIcon style={styles.icon} size={20} color={'#2E6F40'} />
            )}
            renderItem={(item) => (
                <View style={styles.itemContainer}>
                    <NotesTypeIcon icon={item.icon} size={20} color={'#2E6F40'} />
                    <Text style={styles.item}>{item.label}</Text>
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    dropdown: {
        height: 50,
        borderRadius: 20,
        paddingHorizontal: 20,
        backgroundColor: '#CFFFDC',
    },
    icon: {
    },
    placeholderStyle: {
        fontSize: 14,
        marginLeft: 10,
        textAlign: 'left',
        paddingVertical: 15,
    },
    selectedTextStyle: {
        fontSize: 14,
        textAlign: 'left',
        marginLeft: 10,
        paddingVertical: 15,
    },
    itemContainer: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 20,
    },
    item: {
        fontSize: 14,
        alignItems: 'center',
        marginHorizontal: 15,
    },
});

export default DropdownTypeofNotes;