import WIP from '../../../assets/images/undraw_programming_65t2.svg';
import AddNotesFAB from '../../../components/AddNotesFAB';
import FinanceScreen from '../../../components/BottomSheetScreens/FinanceScreen';
import HealthScreen from '../../../components/BottomSheetScreens/HealthScreen';
import HobbyScreen from '../../../components/BottomSheetScreens/HobbyScreen';
import OtherScreen from '../../../components/BottomSheetScreens/OtherScreen';
import SpiritualScreen from '../../../components/BottomSheetScreens/SpiritualScreen';
import WorkScreen from '../../../components/BottomSheetScreens/WorkScreen';
import CustomBottomSheet from '../../../components/CustomBottomSheet';
import {
  FinanceHandleIcon,
  HealthHandleIcon,
  HobbyHandleIcon,
  OtherHandleIcon,
  SpiritualHandleIcon,
  WorkHandleIcon
} from '../../../components/HandleIcons';
import NoteItemCardView from '../../../components/NoteItemCardView';
import Toast from '../../../components/ToastMessage';
import { useFirestore } from '../../../context/FirestoreContext';
import { useNotes } from '../../../context/NotesContext';
import { AuthServices } from '../../../services/AuthServices';
import { NotificationService } from '../../../services/NotificationServices';
import { BottomSheetRefType } from '../../../types/BottomSheet';
import { Notes } from '../../../types/Notes';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  useWindowDimensions
} from 'react-native';

type HandlePressArgs = {
  screen?: string;
  note?: Notes;
};

const PrioritiesScreen = () => {
  const { width, height } = useWindowDimensions();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    getNotesToastMessage,
    noteToastMessage,
    notes,
    syncNotesFromCloud
  } = useNotes();
  const { getNotesFromFirestore } = useFirestore();

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
    }, 2100);

    return () => clearTimeout(timer);
  }, [noteToastMessage, getNotesToastMessage]);

  useEffect(() => {
    const syncAndInitNotifications = async () => {
      try {
        setIsSyncing(true);
        AuthServices.getCurrentUser();

        const cloudNotes = await getNotesFromFirestore();
        syncNotesFromCloud(cloudNotes);
        if (cloudNotes.length > 0) {
          await NotificationService.initializeNotifications(cloudNotes);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncAndInitNotifications();
  }, []);

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
        {!!isSyncing &&
          <ActivityIndicator
            size={'large'}
            color={'#2E6F40'}
            style={[styles.loading, {
              right: (width / 2) - 18,
              bottom: height / 2,
            }]}
          />
        }
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
        <WIP
          width='100%'
          height='100%'
          style={styles.backgroundImage}
        />
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (item.TypeOfNote?.type === 'Priority') {
              return (
                <NoteItemCardView
                  note={item}
                  onPress={(note) => handlePress({ note })}
                />
              )
            } else {
              return null
            }
          }}
          extraData={notes}
          removeClippedSubviews={false}//Helps with animation glitches
          initialNumToRender={8}
          maxToRenderPerBatch={7}
          style={styles.flatlist}
        />
      </KeyboardAvoidingView>
    </>
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
  backgroundImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  flatlist: {
    paddingTop: 10,
  },
  loading: {
    position: 'absolute',
    transform: [{ scale: 2 }],
    zIndex: 1000
  },
});

export default PrioritiesScreen;