import WIP from '../../../assets/images/undraw_coming-soon_7lvi.svg';
import AddNotesFAB from '../../../components/AddNotesFAB';
import FinanceScreen from '../../../components/BottomSheetScreens/FinanceScreen';
import HealthScreen from '../../../components/BottomSheetScreens/HealthScreen';
import HobbyScreen from '../../../components/BottomSheetScreens/HobbyScreen';
import OtherScreen from '../../../components/BottomSheetScreens/OtherScreen';
import SpiritualScreen from '../../../components/BottomSheetScreens/SpiritualScreen';
import WorkScreen from '../../../components/BottomSheetScreens/WorkScreen';
import CustomBottomSheet from '../../../components/CustomBottomSheet';
import {
    DefaultHandleIcon,
    FinanceHandleIcon,
    HealthHandleIcon,
    HobbyHandleIcon,
    OtherHandleIcon,
    SpiritualHandleIcon,
    WorkHandleIcon
} from '../../../components/HandleIcons';
import { BottomSheetRefType } from '../../../types/BottomSheet';
import { Notes } from '../../../types/Notes';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import React, { useCallback, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    StyleSheet,
    Text,
} from 'react-native';

const CalendarScreen = () => {
    const bottomSheetRef = useRef<BottomSheetRefType>(null);
    const [renderedView, setRenderedView] = useState<() => React.ReactNode>(() => () => null);
    const [renderedHandle, setRenderedHandle] = useState<(props: BottomSheetHandleProps) => React.ReactNode>(
        () => DefaultHandleIcon
    );

    // Memoized openWith function
    const openWith = useCallback((
        view: () => React.ReactNode,
        handle: (props: BottomSheetHandleProps) => React.ReactNode
    ) => {
        setRenderedView(() => view);
        setRenderedHandle(() => handle);

        // Add timeout to ensure state updates before showing
        setTimeout(() => {
            bottomSheetRef.current?.show?.();
        }, 50);
    }, []);

    type HandlePressArgs = {
        screen?: string;
        note?: Notes;
    };

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
        <KeyboardAvoidingView
            /**
             * Required this for
             * the KB avoiding view
             * to work
             */
            behavior='height'
            /**
             * Need exactly at 70
             * or it cause some bugs
             * flickering at the bottom screen
             */
            keyboardVerticalOffset={0}
            style={styles.container}
        >
            <CustomBottomSheet
                ref={bottomSheetRef}
                view={renderedView}
                handleIcon={renderedHandle}
            />
            <AddNotesFAB onPress={(screen) => handlePress({ screen })} />
            <WIP
                width='100%'
                height='100%'
                style={styles.backgroundImage}
            />
            <Text style={styles.text}>
                W.I.P
            </Text>
        </KeyboardAvoidingView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F1F1',
        alignItems: 'center',
    },
    text: {
        fontSize: 80,
        fontWeight: 600,
    },
    box: {
        height: 60,
        width: 60,
        backgroundColor: '#fff'
    },
    backgroundImage: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    flatlist: {
        paddingTop: 20,
    },
});

export default CalendarScreen;