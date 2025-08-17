import { NotesCategoryIcon } from "../constant/NotesIcons";
import { BottomSheetDefaultHandleProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetHandle/types";
import { StyleSheet, Text, View } from "react-native";

export const DefaultHandleIcon = ({ style }: BottomSheetDefaultHandleProps) => {
    return (
        <View style={[styles.defaulthandleContainer, style]} />
    );
};

export const WorkHandleIcon = ({ style }: BottomSheetDefaultHandleProps) => {
    return (
        <View style={[styles.handleContainer, style]}>
            <NotesCategoryIcon icon={'work'} size={30} color="#68BA7F" />
            <Text style={styles.titleText}>
                Work
            </Text>
        </View>
    );
};

export const HealthHandleIcon = ({ style }: BottomSheetDefaultHandleProps) => {
    return (
        <View style={[styles.handleContainer, style]}>
            <NotesCategoryIcon icon={'health'} size={30} color="#68BA7F" />
            <Text style={styles.titleText}>
                Health
            </Text>
        </View>
    );
};

export const SpiritualHandleIcon = ({ style }: BottomSheetDefaultHandleProps) => {
    return (
        <View style={[styles.handleContainer, style]}>
            <NotesCategoryIcon icon={'spiritual'} size={30} color="#68BA7F" />
            <Text style={styles.titleText}>
                Spiritual
            </Text>
        </View>
    );
};

export const FinanceHandleIcon = ({ style }: BottomSheetDefaultHandleProps) => {
    return (
        <View style={[styles.handleContainer, style]}>
            <NotesCategoryIcon icon={'finance'} size={30} color="#68BA7F" />
            <Text style={styles.titleText}>
                Finance
            </Text>
        </View>
    );
};

export const HobbyHandleIcon = ({ style }: BottomSheetDefaultHandleProps) => {
    return (
        <View style={[styles.handleContainer, style]}>
            <NotesCategoryIcon icon={'hobby'} size={30} color="#68BA7F" />
            <Text style={styles.titleText}>
                Hobby
            </Text>
        </View>
    );
};

export const OtherHandleIcon = ({ style }: BottomSheetDefaultHandleProps) => {
    return (
        <View style={[styles.handleContainer, style]}>
            <NotesCategoryIcon icon={'other'} size={30} color="#68BA7F" />
            <Text style={styles.titleText}>
                Other
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    defaulthandleContainer: {
        width: 60,
        height: 60,
        borderRadius: 40,
        top: -25,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        backgroundColor: '#CFFFDC'
    },
    handleContainer: {
        width: 100,
        height: 40,
        borderRadius: 40,
        top: -20,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        backgroundColor: '#2E6F40'
    },
    titleText: {
        top: 40,
        height: 60,
        position: 'absolute',
        fontSize: 18,
        color: '#000000',
        fontWeight: 500,
    }
});