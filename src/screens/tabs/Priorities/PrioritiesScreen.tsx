/* eslint-disable react-native/no-inline-styles */
import WIP from '../../../assets/images/undraw_programming_65t2.svg';
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
import {
  useFirestore,
  useNotes,
  useTheme
} from '../../../hooks';
import { AuthServices } from '../../../services/AuthServices';
import { NotificationService } from '../../../services/NotificationServices';
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
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { usePrioritiesNavigation } from '../../../hooks/useNavigation';

type HandlePressArgs = {
  screen?: string;
  note?: Notes;
};

const PrioritiesScreen = () => {
  const { width, height } = Dimensions.get('window');
  const { theme } = useTheme();
  const navigation = usePrioritiesNavigation();
  const scrollY = useSharedValue(0);

  const triadicThemeColor = theme.myColors?.triadic;
  const complementaryThemeColor = theme.myColors?.complementary;
  const primaryFontColor = theme.fontColors?.primary;
  const profileImage = require('../../../assets/images/catMeme.jpg');

  /**
   * This can break usage such as persisting and restoring state.
   * This might happen if you passed non-serializable values such as function,
   * class instances etc. in params.
   * If you need to use components with callbacks in your options,
   * you can use 'navigation.setOptions' instead.
   * See https://reactnavigation.org/docs/troubleshooting#i-get-the-warning-non-serializable-values-were-found-in-the-navigation-state
   * for more details.
   */
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Pass scrollY to header via navigation params
  useEffect(() => {
    navigation.setParams({ scrollY });
  }, [navigation, scrollY]);

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
    /**
     * Put Timer and Clear the message
     * so the useEffect won't be trigger again
     * across other screens or tabs
     */
    const timer = setTimeout(() => {
      getNotesToastMessage(null);
      setShowToast(false);
      setToastMessage(null);
    }, 5000);

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
      <View style={[styles.container, {
        backgroundColor: themeColor,
      }]}>
        {!!isSyncing &&
          <ActivityIndicator
            size={'large'}
            color={'#2E6F40'}
            style={[styles.loading, {
              right: (width * .5) - 18,
              bottom: height * .6,
            }]}
          />
        }
        <Toast
          message={toastMessage ?? ''}
          visible={showToast}
          onHide={() => setShowToast(false)}
          containerStyle={{
            bottom: '90%',
          }}
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
        <Animated.FlatList
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
          ListHeaderComponent={() => (
            <View style={[styles.listHeaderContainer, {
              marginHorizontal: width * .04,
              marginBottom: height * .02,
            }]}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../../assets/bootsplash/priority.png')}
                  style={{
                    width: width * .125,
                    height: width * .125,
                  }}
                  resizeMode='contain'
                />
              </View>
              <Text style={[styles.largeTitle, {
                color: primaryFontColor,
              }]}>Priorities</Text>
              <View style={styles.accountImageContainer}>
                <View style={[styles.accountImageOutline, {
                  width: width * .140,
                  height: width * .140,
                  backgroundColor: complementaryThemeColor,
                }]}>
                  <TouchableOpacity style={styles.imageButton}>
                    <Image
                      style={[styles.accountImage, {
                        height: width * .125,
                        width: width * .125,
                      }]}
                      source={profileImage}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={{
            width: width,
            alignSelf: 'flex-start',
          }}
          extraData={notes}
          removeClippedSubviews={false}//Helps with animation glitches
          initialNumToRender={8}
          maxToRenderPerBatch={7}
          style={styles.flatlist}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
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
  listHeaderContainer: {
    flexDirection: 'row',
  },
  largeTitle: {
    fontSize: 40,
    letterSpacing: 3,
    fontWeight: 600,
    textAlignVertical: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    //alignItems: 'flex-end',
    //marginLeft: 40,
    marginRight: 16,
  },
  accountImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: 32,
    paddingRight: 8,
  },
  accountImageOutline: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
  },
  imageButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
  },
  accountImage: {
    borderRadius: 200,
  },
  flatlist: {
    paddingBottom: 10,
  },
  loading: {
    position: 'absolute',
    transform: [{ scale: 2 }],
    zIndex: 1000
  },
});

export default PrioritiesScreen;