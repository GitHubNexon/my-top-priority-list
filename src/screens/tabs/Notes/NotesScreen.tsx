import BgImage from '../../../assets/images/undraw_select_u1sa.svg';
import {
    AddNotesFAB,
    CustomBottomSheet,
    NoteItemCardView
} from '../../../components/index';
import {
    WorkScreen,
    HealthScreen,
    SpiritualScreen,
    FinanceScreen,
    HobbyScreen,
    OtherScreen
} from '../../../components/BottomSheetScreens/index';
import {
    FinanceHandleIcon,
    HealthHandleIcon,
    HobbyHandleIcon,
    OtherHandleIcon,
    SpiritualHandleIcon,
    WorkHandleIcon
} from '../../../components/HandleIcons';
import Toast from '../../../components/ToastMessage';
import { useNotes, useTheme } from '../../../hooks';
import { BottomSheetRefType } from '../../../types/BottomSheet';
import { Notes } from '../../../types/Notes';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import {
    StyleSheet,
    View
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

type HandlePressArgs = {
    screen?: string;
    note?: Notes;
};

const NotesScreen = () => {
    const { theme } = useTheme();
    const themeColor = theme.myColors?.triadic;

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const {
        getNotesToastMessage,
        noteToastMessage,
        notes,
    } = useNotes();

    useEffect(() => {
        if (noteToastMessage) {
            setShowToast(true);
            setToastMessage(noteToastMessage);
        }
        // Clear the message after showing it
        const timer = setTimeout(() => {
            getNotesToastMessage(null);
            setShowToast(false);
            setToastMessage(null);
        }, 5000);

        return () => clearTimeout(timer);
    }, [noteToastMessage, getNotesToastMessage]);

    const bottomSheetRef = useRef<BottomSheetRefType>(null);
    const [renderedView, setRenderedView] = useState<() => React.ReactNode>(() => () => null);
    const [renderedHandle, setRenderedHandle] = useState<((props: BottomSheetHandleProps) => React.ReactNode) | null>(null);
    const [pendingOpen, setPendingOpen] = useState(false);

    const waitForRender = () => new Promise(resolve => requestAnimationFrame(resolve));

    /**
    * Temporary fixed for delay rendering
    * of bottomsheet
    * @waitForRender
    * @useEffect ({},[pendingOpen, renderedHandle])
    * @requestAnimationFrame
    */
    useEffect(() => {
        if (pendingOpen && renderedHandle) {
            bottomSheetRef.current?.expand?.();
            setPendingOpen(false);
        }
    }, [pendingOpen, renderedHandle]);

    // Memoized openWith function
    const openWith = useCallback(async (
        view: () => React.ReactNode,
        handle: (props: BottomSheetHandleProps) => React.ReactNode
    ) => {
        setRenderedView(() => view);
        setRenderedHandle(() => handle);

        /**
         * Temporary fixed for delay rendering
         * of bottomsheet
         */
        await waitForRender();
        requestAnimationFrame(() => {
            setPendingOpen(true);
        });
    }, []);

    // Handle press with proper error boundaries
    const handlePress = useCallback((args?: HandlePressArgs) => {
        const screen = args?.screen;
        const note = args?.note;

        try {
            switch (note?.NotesCategory || screen) {
                case 'work':
                    openWith(
                        () => <WorkScreen
                            notesProp={note}
                            bottomSheetRef={bottomSheetRef as React.RefObject<{ close: () => void }>} />,
                        WorkHandleIcon
                    );
                    break;
                case 'health':
                    openWith(
                        () => <HealthScreen
                            notesProp={note}
                            bottomSheetRef={bottomSheetRef as React.RefObject<{ close: () => void }>} />,
                        HealthHandleIcon
                    );
                    break;
                case 'spiritual':
                    openWith(
                        () => <SpiritualScreen
                            notesProp={note}
                            bottomSheetRef={bottomSheetRef as React.RefObject<{ close: () => void }>} />,
                        SpiritualHandleIcon
                    );
                    break;
                case 'finance':
                    openWith(
                        () => <FinanceScreen
                            notesProp={note}
                            bottomSheetRef={bottomSheetRef as React.RefObject<{ close: () => void }>} />,
                        FinanceHandleIcon
                    );
                    break;
                case 'hobby':
                    openWith(
                        () => <HobbyScreen
                            notesProp={note}
                            bottomSheetRef={bottomSheetRef as React.RefObject<{ close: () => void }>} />,
                        HobbyHandleIcon
                    );
                    break;
                case 'other':
                    openWith(
                        () => <OtherScreen
                            notesProp={note}
                            bottomSheetRef={bottomSheetRef as React.RefObject<{ close: () => void }>} />,
                        OtherHandleIcon
                    );
                    break;
                default:
                    return null;
            }
        } catch (error) {
            console.error('Error handling note press:', error);
        }
    }, [openWith]);

    return (
        <>
            <View style={[styles.container, {
                backgroundColor: themeColor,
            }]}>
                <Toast
                    message={toastMessage ?? ''}
                    visible={showToast}
                    onHide={() => setShowToast(false)}
                />
                {renderedView && renderedHandle && (
                    <CustomBottomSheet
                        ref={bottomSheetRef}
                        view={renderedView}
                        handleIcon={renderedHandle}
                    />
                )}
                <AddNotesFAB onPress={(screen) => handlePress({ screen })} />
                <BgImage
                    width='100%'
                    height='100%'
                    style={styles.backgroundImage}
                />
                <FlatList
                    data={notes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <NoteItemCardView
                            note={item}
                            onPress={(note) => handlePress({ note })}
                        />
                    )}
                    extraData={notes}
                    removeClippedSubviews={false}//Helps with animation glitches
                    initialNumToRender={10}
                    maxToRenderPerBatch={5}
                    style={styles.flatlist}
                />
            </View>
        </>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    text: {
        fontSize: 80,
        fontWeight: 600,
    },
    backgroundImage: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    flatlist: {
        paddingBottom: 10,
    },
});

export default NotesScreen;