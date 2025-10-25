/* eslint-disable react-native/no-inline-styles */
import {
    CategoryLeftIcon,
    CategoryRightIcon,
    FinanceCategoryIcons
} from '../../icons';
import {
    useAuth,
    useFirestore,
    useNotes,
} from '../../hooks';
import { BottomSheetScreenProps } from '../../types/BottomSheet';
import { Notes, NoteType } from '../../types/Notes';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import CustomDateTimePicker from '../CustomDateTimePicker';
import DropdownTypeofNotes from '../DropdownTypeofNotes';
import { BottomSheetWrapper } from '../Wrapper';

const financeTypeList = [
    { label: 'Expenses', value: 'Expenses', icon: 'expenses' },
    { label: 'Budget', value: 'Budget', icon: 'budget' },
    { label: 'Miscellaneous', value: 'Miscellaneous', icon: 'miscellaneous' },
];

const occurrenceList = [
    { label: 'Daily', value: 'Daily', icon: 'calendar' },
    { label: 'Weekly', value: 'Weekly', icon: 'calendar' },
    { label: 'Monthly', value: 'Monthly', icon: 'calendar' },
    { label: 'Yearly', value: 'Yearly', icon: 'calendar' },
    { label: 'One Time', value: 'One Time', icon: 'calendar' },
];

type FinanceScreenProps = BottomSheetScreenProps & {
    notesProp?: Notes;
};

const FinanceScreen = ({ bottomSheetRef, notesProp }: FinanceScreenProps) => {
    const isEditing = !!notesProp?.id;

    const { getNotesToastMessage, updateNote, addNote } = useNotes();
    const { uploadNoteInFirestore, updateNoteInFirestore } = useFirestore();
    const [noteTitle, setNoteTitle] = useState(notesProp?.Title ?? '');
    const [financeTypeValue, setFinanceTypeValue] = useState<string | null>(
        notesProp?.TypeOfNotesCategory?.type ?? null
    );
    const [occurrenceTypeValue, setOccurrenceTypeValue] = useState(
        notesProp?.Occurrence ?? ''
    );
    const [isDropdownFocus, setIsDropdownFocus] = useState(false);
    const [amount, setAmount] = useState(notesProp?.Amount ?? '');
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
    const [isFocus, setIsFocus] = useState(false);

    const { uid } = useAuth();

    useEffect(() => {
        if (!notesProp) return;

        const updateStates = () => {
            if (notesProp.Title) setNoteTitle(notesProp.Title);
            if (notesProp.TypeOfNotesCategory?.type) setFinanceTypeValue(notesProp.TypeOfNotesCategory.type);
            if (notesProp.Occurrence) setOccurrenceTypeValue(notesProp.Occurrence);
            if (notesProp.Amount) setAmount(notesProp.Amount);
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
        const selectedFinanceType = financeTypeList.find(item => item.value === financeTypeValue);
        const selectedNoteType = noteTypeValue;

        if (!selectedFinanceType || !selectedNoteType) {
            Alert.alert('Please fill in required fields.');
            return;
        };

        const noteData: Notes = {
            NotesCategory: 'finance',
            id: isEditing ? notesProp.id : uuidv4(),
            Title: noteTitle,
            TypeOfNotesCategory: {
                type: selectedFinanceType.value,
                icon: selectedFinanceType.icon,
            },
            Occurrence: occurrenceTypeValue,
            Amount: amount,
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
                getNotesToastMessage('Note updated successfully.')
            } catch (error: unknown) {
                let errorMessage = 'Failed to update note.';

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
                getNotesToastMessage('Note saved successfully.')
            } catch (error: unknown) {
                let errorMessage = 'Failed to save note.';

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
        setFinanceTypeValue(null);
        setOccurrenceTypeValue('')
        setAmount('')
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
                    placeholder='Title'
                    style={styles.titleInput}
                />
                <View style={styles.financeTypeContainer}>
                    <View style={styles.financeTypeContent}>
                        <Text style={styles.titleText}>Type: </Text>
                        <Dropdown
                            style={styles.dropdown}
                            maxHeight={300}
                            placeholderStyle={styles.placeholderStyle}
                            placeholder={!isFocus ? 'Type' : 'Select a Type'}
                            renderLeftIcon={() => {
                                const selectedItem = financeTypeList.find(d => d.value === financeTypeValue);

                                return selectedItem ? (
                                    <FinanceCategoryIcons icon={selectedItem.icon} size={20} color='#2E6F40' />
                                ) : (
                                    <CategoryLeftIcon size={20} color='#2E6F40' />
                                );
                            }}
                            renderRightIcon={() => (
                                <CategoryRightIcon style={styles.icon} size={20} color={'#2E6F40'} />
                            )}
                            renderItem={(item) => (
                                <View style={styles.itemContainer}>
                                    <FinanceCategoryIcons icon={item.icon} size={20} color={'#2E6F40'} />
                                    <Text style={styles.item}>{item.label}</Text>
                                </View>
                            )}
                            itemContainerStyle={{
                                borderRadius: 20,
                            }}
                            containerStyle={{
                                borderRadius: 20,
                            }}
                            data={financeTypeList}
                            value={financeTypeValue}
                            valueField='value'
                            itemTextStyle={{ textAlign: 'left' }}
                            labelField='label'
                            selectedTextStyle={styles.selectedTextStyle}
                            activeColor='#CFFFDC'
                            onFocus={() => setIsFocus(true)}
                            onBlur={() => setIsFocus(false)}
                            onChange={item => {
                                setFinanceTypeValue(item.value);
                                setIsFocus(false);
                            }}
                        />
                    </View>
                    <View style={styles.financeTypeContent}>
                        <Text style={styles.titleText}>Occurrence: </Text>
                        <Dropdown
                            style={styles.dropdown}
                            maxHeight={300}
                            placeholderStyle={styles.placeholderStyle}
                            placeholder={!isDropdownFocus ? 'Type' : 'Select a Type'}
                            itemContainerStyle={{
                                borderRadius: 20,
                            }}
                            containerStyle={{
                                borderRadius: 20,
                            }}
                            renderLeftIcon={() => (
                                <MaterialIcons name='event-repeat' size={20} color='#2E6F40' />
                            )}
                            renderRightIcon={() => (
                                <CategoryRightIcon style={styles.icon} size={20} color={'#2E6F40'} />
                            )}
                            data={occurrenceList}
                            value={occurrenceTypeValue}
                            valueField='value'
                            itemTextStyle={{ textAlign: 'left' }}
                            labelField='label'
                            selectedTextStyle={styles.selectedTextStyle}
                            activeColor='#CFFFDC'
                            onFocus={() => setIsDropdownFocus(true)}
                            onBlur={() => setIsDropdownFocus(false)}
                            onChange={item => {
                                setOccurrenceTypeValue(item.value);
                                setIsDropdownFocus(false);
                            }}
                        />
                    </View>
                </View>
                <Text style={styles.titleText}>Amount: </Text>
                <TextInput
                    inputMode='numeric'
                    value={amount}
                    onChangeText={setAmount}
                    placeholderTextColor={'#4b4b4b88'}
                    placeholder='0.00'
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
    financeTypeContainer: {
        width: '100%',
        flexDirection: 'row',
        gap: 10,
    },
    financeTypeContent: {
        flex: 1,
        flexDirection: 'column',
    },
    dropdown: {
        height: 50,
        borderRadius: 20,
        paddingHorizontal: 20,
        backgroundColor: '#CFFFDC',
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

export default FinanceScreen;