/**
 * Portal components to fixed overlay issue
 * like absolute position, customized bottom tab bar
 * GUIDE: Wrap your _layout.tsx or RootLayout on <PortalProvider>
 */
import { BottomSheetRefType } from '../types/BottomSheet';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetHandleProps,
    BottomSheetScrollView,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import React, {
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    StyleSheet,
    TouchableWithoutFeedback,
    useWindowDimensions
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    view: () => React.ReactNode;
    handleIcon: (props: BottomSheetHandleProps) => React.ReactNode;
    ref?: React.Ref<BottomSheetRefType>;
};

const CustomBottomSheet = ({ view, handleIcon, ref }: Props) => {
    const { width } = useWindowDimensions();

    /**
     * Added safeareContext
     * to avoid BottomSheet overshooting
     */
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null)
    /**
     * Only one snapPoints
     * cause if not on the highest snapPoints
     * BottomSheetScrollView won't work
     * Don't use percentage if you're
     * using KeyboardAvoidingView
     */
    const snapPoints = useMemo(() => ['80%'], []);

    //Backdrop when botomsheet is open
    const backDrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                opacity={0.9}
                style={{ backgroundColor: '#253D2C' }}
            />
        ), []
    );

    useImperativeHandle(ref, () => ({
        snapToIndex: () => bottomSheetRef.current?.snapToIndex(0),
        close: () => bottomSheetRef.current?.close(),
        expand: () => bottomSheetRef.current?.expand(),
    }));

    return (
        <Portal>
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                /**
                 * Required to disable overdrag if you have
                 * KeyboardVvoidingView enabled
                 * if not 
                 * it will overshoot
                 * at the highest snapPoints you provided
                 */
                enableOverDrag={false}
                backgroundStyle={[styles.bgStyle, {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                }]}
                backdropComponent={backDrop}
                handleComponent={handleIcon}
            >
                <BottomSheetView style={[styles.container, { width: width }]}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                        >
                            <BottomSheetScrollView
                                keyboardShouldPersistTaps='handled'
                                nestedScrollEnabled={true}
                            >
                                {view()}
                            </BottomSheetScrollView>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </BottomSheetView>
            </BottomSheet>
        </Portal>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        alignItems: 'center',
        padding: 20,
        paddingTop: 10,
    },
    bgStyle: {
        backgroundColor: '#68BA7F',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
});

export default CustomBottomSheet;