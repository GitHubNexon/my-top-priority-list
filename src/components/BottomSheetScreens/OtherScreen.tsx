import {
    useAlarmManager,
    useAuth,
    useFirestore,
    useNotes,
} from '../../hooks';
import { BottomSheetScreenProps } from '../../types/BottomSheet';
import { Notes, NoteType } from '../../types/Notes';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput
} from "react-native";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import CustomDateTimePicker from '../CustomDateTimePicker';
import DropdownTypeofNotes from '../DropdownTypeofNotes';
import { BottomSheetWrapper } from '../Wrapper';
import { RecurrenceType } from '../../types/Alarm';
import { getOneTimeAlarmFromUtcString } from '../../utils/alarm';

type OtherScreenProps = BottomSheetScreenProps & {
    notesProp?: Notes;
};

const OtherScreen = ({ bottomSheetRef, notesProp }: OtherScreenProps) => {
    const isEditing = !!notesProp?.id;

    const { getNotesToastMessage, updateNote, addNote } = useNotes();
    const { uploadNoteInFirestore, updateNoteInFirestore } = useFirestore();
    const [noteTitle, setNoteTitle] = useState(notesProp?.Title ?? '');
    const [noteTypeValue, setNoteTypeValue] = useState<NoteType | null>(
        notesProp?.TypeOfNotesCategory?.type
            ? {
                value: notesProp.TypeOfNotesCategory.type,
                label: notesProp.TypeOfNotesCategory.type,
                icon: notesProp.TypeOfNotesCategory.icon ?? '',
            }
            : null
    );
    const [description, setDescription] = useState(notesProp?.Description ?? '');
    const [dateTimeData, setDateTimeData] = useState<{
        date: string;
        time: string;
        days: string[];
    }>({
        date: notesProp?.Date ?? '',
        time: notesProp?.Time ?? '',
        days: notesProp?.Days ?? [],
    });

    const { uid } = useAuth();
    const alarmManager = useAlarmManager();

    useEffect(() => {
        if (!notesProp) return;

        const updateStates = () => {
            if (notesProp.Title) setNoteTitle(notesProp.Title);
            if (notesProp.TypeOfNote?.type) {
                setNoteTypeValue({
                    value: notesProp.TypeOfNote.type,
                    label: notesProp.TypeOfNote.type,
                    icon: notesProp.TypeOfNote.icon ?? '',
                });
            }
            if (notesProp.Description) setDescription(notesProp.Description);
            if (notesProp.Date || notesProp.Time || notesProp.Days) {
                setDateTimeData({
                    date: notesProp.Date ?? '',
                    time: notesProp.Time ?? '',
                    days: notesProp.Days ?? [],
                });
            }
        };

        updateStates();
    }, [notesProp]);

    const handleSubmit = () => {
        const selectedNoteType = noteTypeValue;

        if (!selectedNoteType) {
            Alert.alert("Please fill in required fields.");
            return;
        };

        const noteData: Notes = {
            NotesCategory: 'other',
            id: isEditing ? notesProp.id : uuidv4(),
            Title: noteTitle,
            TypeOfNote: {
                type: selectedNoteType.value,
                icon: selectedNoteType.icon,
            },
            Description: description,
            Date: dateTimeData.date,
            Time: dateTimeData.time,
            Days: dateTimeData.days,
        };

        if (isEditing) {
            const { id, ...updatedFields } = noteData;
            try {
                updateNote(id, updatedFields);
                updateNoteInFirestore(uid ?? '', id, noteData);
                const timestamp = getOneTimeAlarmFromUtcString(noteData.Time ?? '', noteData.Date)
                const requestCode = alarmManager?.scheduleAlarm({
                    timestamp: timestamp,
                    title: noteData.Title,
                    message: noteData.Description ?? '',
                    recurrenceType: RecurrenceType.DAILY,
                });
                console.log('Alarm scheduled ✅ with code:', requestCode);
                console.log('Time: ', noteData.Time);
                console.log('Date: ', noteData.Date);
                getNotesToastMessage("Note updated successfully.")
            } catch (error: unknown) {
                let errorMessage = "Failed to update note.";

                if (error instanceof Error) {
                    errorMessage = error.message;
                };
                getNotesToastMessage(errorMessage);
                throw errorMessage;
            };
            bottomSheetRef?.current?.close();
        } else {
            try {
                addNote(noteData);
                uploadNoteInFirestore(noteData);
                const timestamp = getOneTimeAlarmFromUtcString(noteData.Time ?? '',noteData.Date)
                const requestCode = alarmManager?.scheduleAlarm({
                    timestamp: timestamp,
                    title: noteData.Title,
                    message: noteData.Description ?? '',
                    recurrenceType: RecurrenceType.DAILY,
                });
                console.log('Alarm scheduled ✅ with code:', requestCode);
                console.log('Time: ', noteData.Time);
                console.log('Date: ', noteData.Date);
                getNotesToastMessage("Note saved successfully.")
            } catch (error: unknown) {
                let errorMessage = "Failed to save note.";

                if (error instanceof Error) {
                    errorMessage = error.message;
                };
                getNotesToastMessage(errorMessage);
                throw errorMessage;
            };
            bottomSheetRef?.current?.close();
        };

        // Optional reset
        setNoteTitle('');
        setNoteTypeValue(null);
        setDescription('');
        setDateTimeData({ date: '', time: '', days: [] });
    };

    return (
        <>
            <BottomSheetWrapper>
                <Text style={styles.titleText}>Title: </Text>
                <TextInput
                    value={noteTitle}
                    onChangeText={setNoteTitle}
                    placeholderTextColor={'#4b4b4b88'}
                    placeholder="Title"
                    style={styles.titleInput}
                />
                <Text style={styles.titleText}>Type of Note: </Text>
                <DropdownTypeofNotes
                    value={noteTypeValue}
                    onChangeItem={(item) => setNoteTypeValue(item)}
                />
                <Text style={styles.titleText}>Description: </Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholderTextColor={'#4b4b4b88'}
                    placeholder='Type here...'
                    spellCheck={true}
                    scrollEnabled
                    autoCapitalize='sentences'
                    multiline={true}
                    style={styles.descriptionInput}
                />
                <Text style={styles.titleText}>Set an Alarm</Text>
                <CustomDateTimePicker
                    value={dateTimeData}
                    onChange={(data) => setDateTimeData(data)}
                />
            </BottomSheetWrapper>
            <Pressable onPress={handleSubmit} style={styles.saveButton}>
                <Text style={styles.buttonText}>Save</Text>
            </Pressable>
        </>
    );
};

const styles = StyleSheet.create({
    titleText: {
        marginLeft: 20,
        marginBottom: 2,
        marginTop: 15,
        fontSize: 16,
        color: '#000000'
    },
    titleInput: {
        height: 50,
        borderRadius: 20,
        paddingHorizontal: 20,
        backgroundColor: '#CFFFDC',
        textAlign: 'left',
        color: '#000000',
        fontSize: 14,
    },
    descriptionInput: {
        height: 200,
        textAlignVertical: 'top',
        alignItems: 'flex-start',
        borderRadius: 20,
        backgroundColor: '#CFFFDC',
        color: '#000000',
        fontSize: 14,
        padding: 20,
    },
    saveButton: {
        width: 150,
        height: 50,
        marginTop: 30,
        marginBottom: 30,
        borderRadius: 30,
        backgroundColor: '#CFFFDC',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 20,
    },
});

export default OtherScreen;