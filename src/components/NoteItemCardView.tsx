import {
  FinanceCategoryIcon,
  HealthCategoryIcon,
  HobbyCategoryIcon,
  NotesCategoryIcon,
  NotesTypeIcon,
  SpiritualCategoryIcon,
  WorkCategoryIcon,
} from '../constant/NotesIcons';
import { useAuth } from '../hooks/useAuths';
import { useFirestore } from '../context/FirestoreContext';
import { useNotes } from '../context/NotesContext';
import { Notes } from '../types/Notes';
import {
  formatDate,
  formatDays,
  formatTime
} from '../utils/DateFormatter';
import Ionicons from '@react-native-vector-icons/ionicons';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import {
  Dimensions,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

type Props = {
  note: Notes;
  onPress: (note: Notes) => void;
};

const NoteItemCardView = ({ note, onPress }: Props) => {
  const { getNotesToastMessage, deleteNote } = useNotes();
  const { deleteNoteFromFirestore } = useFirestore();
  const { uid } = useAuth();

  const { width } = useWindowDimensions();

  const isLargeDisplay = width > 425;

  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const LIST_ITEM_HEIGHT = 110;
  const TRANSLATE_X_THRESHOLD = - SCREEN_WIDTH * 0.35;

  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(LIST_ITEM_HEIGHT);
  const marginVertical = useSharedValue(5);
  const padding = useSharedValue(10);

  const handleDeleteNote = async (note: Notes) => {
    deleteNote(note);
    try {
      await deleteNoteFromFirestore(uid ?? '', note.id);
      getNotesToastMessage("Note deleted successfully.");
    } catch (error: unknown) {
      let errorMessage = "Failed to delete note.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      getNotesToastMessage(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const doubleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {
      /**
       * ⚠️⚠️REMEMBER ⚠️⚠️⚠️
       * always put a fucking runOnJS
       */
      runOnJS(onPress)(note);
    });

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) //Block vertical gesture recognition
    .failOffsetY([-5, 5]) //Trigger only if gesture moves horizontally
    .onUpdate((e) => {
      const translation = e.translationX;
      translateX.value = translation;
    })
    .onEnd(() => {
      const shouldBeDismissed = translateX.value < TRANSLATE_X_THRESHOLD;

      if (shouldBeDismissed) {
        translateX.value = withTiming(-SCREEN_WIDTH);
        itemHeight.value = withTiming(0, { duration: 300 });
        marginVertical.value = withTiming(0, { duration: 300 });
        padding.value = withTiming(0, { duration: 300 }, () => {
          console.log(`Deleted Note ID: ${note.id}`)
          /**
           * ⚠️⚠️REMEMBER ⚠️⚠️⚠️
           * always put a fucking runOnJS
           */
          runOnJS(handleDeleteNote)(note);
        });
      } else {
        translateX.value = withTiming(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteIconAnimationStyle = useAnimatedStyle(() => {
    const opacity = withTiming(
      translateX.value < TRANSLATE_X_THRESHOLD ? 1 : 0
    );
    return { opacity };
  });

  const cardContainerAnimationStyle = useAnimatedStyle(() => {
    return {
      height: itemHeight.value,
      marginVertical: marginVertical.value,
      padding: padding.value,
    };
  });

  return (
    <>
      <Animated.View style={[styles.deleteIconContainer, deleteIconAnimationStyle,]}>
        <MaterialIcons name="delete-forever" size={80} color="#ff0000" />
      </Animated.View>
      <GestureDetector
        gesture={Gesture.Exclusive(panGesture, doubleTapGesture)}
      >
        <Animated.View style={[
          styles.cardContainer,
          animatedStyle,
          cardContainerAnimationStyle,
          isLargeDisplay && styles.isLargeDisplayCardContainer
        ]}>
          <View style={styles.iconContainer}>
            <NotesCategoryIcon icon={note.NotesCategory} size={70} color="#2E6F40" enableFill />
          </View>
          <View style={styles.noteContainer}>
            <View style={[
              styles.noteTitle,
              isLargeDisplay && styles.isLargeDisplayNoteTitle
            ]}>
              <View style={styles.iconTitleContainer}>
                {!!note.TypeOfNotesCategory?.icon &&
                  (() => {
                    switch (note.NotesCategory) {
                      case 'work':
                        return (
                          <WorkCategoryIcon
                            icon={note.TypeOfNotesCategory.icon}
                            size={16}
                            color="#2E6F40"
                            enableFill
                          />
                        );
                      case 'health':
                        return (
                          <HealthCategoryIcon
                            icon={note.TypeOfNotesCategory.icon}
                            size={16}
                            color="#2E6F40"
                            enableFill
                          />
                        );
                      case 'spiritual':
                        return (
                          <SpiritualCategoryIcon
                            icon={note.TypeOfNotesCategory.icon}
                            size={16}
                            color="#2E6F40"
                            enableFill
                          />
                        );
                      case 'finance':
                        return (
                          <FinanceCategoryIcon
                            icon={note.TypeOfNotesCategory.icon}
                            size={16}
                            color="#2E6F40"
                            enableFill
                          />
                        );
                      case 'hobby':
                        return (
                          <HobbyCategoryIcon
                            icon={note.TypeOfNotesCategory.icon}
                            size={16}
                            color="#2E6F40"
                            enableFill
                          />
                        );
                      default:
                        return null;
                    }
                  })()
                }
              </View>
              <Text numberOfLines={1} style={styles.title}>{note.Title}</Text>
            </View>
            <View style={[
              styles.line,
              isLargeDisplay && styles.isLargeDisplayLine
            ]} />
            {!!note.Description && (
              <View style={[
                styles.descriptionContainer,
                isLargeDisplay && styles.isLargeDisplayDescriptionContainer
              ]}>
                <Text style={styles.description}>{note.Description}</Text>
              </View>
            )}
            <View style={[
              styles.dateContainer,
              isLargeDisplay && styles.isLargeDisplayDateContainer
            ]}>
              {!!note.Occurrence && (
                <>
                  <MaterialIcons name="event-repeat" size={18} color="#253D2C" />
                  <Text style={styles.date}>{note.Occurrence}</Text>
                </>
              )}
              {!!note.Date && (
                <>
                  <Ionicons name="calendar" size={18} color="#253D2C" />
                  <Text style={styles.date}>{formatDate(note.Date)}</Text>
                </>
              )}
              {!!note.Time && (
                <>
                  <MaterialDesignIcons name="clock" size={18} color="#253D2C" />
                  <Text style={styles.date}>{formatTime(note.Time)}</Text>
                </>
              )}
              {!!note.Days?.length && (
                <View style={styles.daysContainer}>
                  {formatDays(note.Days).map(day => (
                    <View key={day} style={styles.daysContent}>
                      <Text style={styles.dayText}>{day}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <View style={[
              styles.noteTypeContainer,
              isLargeDisplay && styles.isLargeDisplayNoteTypeContainer
            ]}>
              {note.TypeOfNote
                ? (<NotesTypeIcon
                  icon={note.TypeOfNote?.icon}
                  size={22} color="#A8E6A2"
                  enableFill
                />)
                : (<MaterialIcons
                  name="info"
                  size={24}
                  color="#CFFFDC"
                />)
              }
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#68BA7F',
    marginHorizontal: 15,
    width: 360,
    borderRadius: 30,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  isLargeDisplayCardContainer: {
    width: 460,
  },
  iconContainer: {
    backgroundColor: '#CFFFDC',
    height: 90,
    width: 90,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteContainer: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  noteTitle: {
    flexDirection: 'row',
    width: 240,
    height: 30,
    overflow: 'hidden',
  },
  isLargeDisplayNoteTitle: {
    width: 340,
  },
  iconTitleContainer: {
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: '#CFFFDC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginLeft: 5,
  },
  line: {
    height: 2,
    width: 240,
    backgroundColor: '#cfffdc6a',
  },
  isLargeDisplayLine: {
    width: 340,
  },
  descriptionContainer: {
    width: 240,
    height: 35,
    marginBottom: 5,
    overflow: 'hidden'
  },
  isLargeDisplayDescriptionContainer: {
    width: 340,
  },
  description: {
    fontSize: 14,
    textAlign: 'justify',
    fontFamily: 'MyFont',
  },
  dateContainer: {
    flexDirection: 'row',
    width: 230,
    height: 24,
    position: 'absolute',
    top: 67,
    alignItems: 'center',
    overflow: 'hidden',
  },
  isLargeDisplayDateContainer: {
    width: 330,
  },
  date: {
    marginTop: 2,
    marginLeft: 3,
    marginRight: 10,
    fontSize: 12,
  },
  noteTypeContainer: {
    position: 'absolute',
    width: 60,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    backgroundColor: '#2E6F40',
    left: 192,
    bottom: 75,
  },
  isLargeDisplayNoteTypeContainer: {
    left: 292,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  daysContent: {
    height: 19,
    width: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 80,
    backgroundColor: '#CFFFDC'
  },
  dayText: {
    fontSize: 8,
  },
  deleteIconContainer: {
    flex: 1,
    position: 'absolute',
    right: 40,
    top: 20,
    zIndex: -1,
  }
});

export default NoteItemCardView;