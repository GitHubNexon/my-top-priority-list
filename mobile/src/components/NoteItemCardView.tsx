import {
  FinanceCategoryIcons,
  HealthCategoryIcons,
  HobbyCategoryIcons,
  NotesCategoryIcons,
  NotesTypeIcons,
  SpiritualCategoryIcons,
  WorkCategoryIcons,
} from '../icons';
import {
  useAuth,
  useFirestore,
  useNotes,
  useTheme,
} from '../hooks';
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
  View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Fontisto from '@react-native-vector-icons/fontisto';
import { isTruncated, truncatedText } from '../utils/truncatedText';

type Props = {
  note: Notes;
  onPress: (note: Notes) => void;
};

const NoteItemCardView = ({ note, onPress }: Props) => {
  const { width } = Dimensions.get('window');
  const { theme } = useTheme();
  const { getNotesToastMessage, deleteNote } = useNotes();
  const { deleteNoteFromFirestore } = useFirestore();
  const { uid } = useAuth();

  const LIST_ITEM_HEIGHT = 110;
  const TRANSLATE_X_THRESHOLD = - width * 0.25;

  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(LIST_ITEM_HEIGHT);
  const marginVertical = useSharedValue(5);
  const padding = useSharedValue(10);

  const primaryColor = theme.myColors?.primary;
  const secondaryColor = theme.myColors?.triadic;
  const complementaryColor = theme.myColors?.complementary;
  const analogousColor = theme.myColors?.analogous;
  const primaryFontColor = theme.fontColors?.primary;
  const secondaryFontColor = theme.fontColors?.secondary;
  const truncatedDescription = truncatedText(note.Description ?? '', 100);

  const handleDeleteNote = async (currentNote: Notes) => {
    deleteNote(currentNote);
    try {
      await deleteNoteFromFirestore(uid ?? '', note.id);
      getNotesToastMessage('Note deleted successfully.');
    } catch (error: unknown) {
      let errorMessage = 'Failed to delete note.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      getNotesToastMessage(errorMessage);
      throw errorMessage;
    }

  };

  const doubleTapGesture = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {
      scheduleOnRN(onPress, note);
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
        translateX.value = withTiming(-width);
        itemHeight.value = withTiming(0, { duration: 300 });
        marginVertical.value = withTiming(0, { duration: 300 });
        padding.value = withTiming(0, { duration: 300 }, () => {
          scheduleOnRN(handleDeleteNote, note);
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
      <Animated.View style={[styles.deleteIconContainer, deleteIconAnimationStyle, {
        right: width * .065,
        top: width * .06,
      }]}>
        <MaterialIcons name='delete-forever' size={80} color='#E43636' />
      </Animated.View>
      <GestureDetector
        gesture={Gesture.Exclusive(panGesture, doubleTapGesture)}
      >
        <Animated.View style={[
          styles.cardContainer,
          animatedStyle,
          cardContainerAnimationStyle,
          {
            backgroundColor: primaryColor,
            width: width - 30,
            height: width * .27
          }
        ]}>
          <View style={styles.content}>
            <View style={[styles.notesCategoryIconContainer, {
              backgroundColor: secondaryColor,
              width: width * .225,
              height: width * .225,
            }]}>
              <NotesCategoryIcons
                icon={note.NotesCategory}
                size={60}
                color={analogousColor}
                enableFill
              />
            </View>
            <View style={[styles.notesContentContainer, {
              width: width * .22,
              height: width * .22,
            }]}>
              <View style={[styles.notesTitleContainer, {
                height: width * .06,
                width: width * .5
              }]}>
                <View style={[styles.iconTitleContainer, {
                  width: width * .06,
                  height: width * .06
                }]}>
                  {(() => {
                    switch (note.NotesCategory) {
                      case 'work':
                        return (
                          <WorkCategoryIcons
                            icon={note.TypeOfNotesCategory?.icon}
                            size={16}
                            color={complementaryColor}
                            enableFill
                          />
                        );
                      case 'health':
                        return (
                          <HealthCategoryIcons
                            icon={note.TypeOfNotesCategory?.icon}
                            size={16}
                            color={complementaryColor}
                            enableFill
                          />
                        );
                      case 'spiritual':
                        return (
                          <SpiritualCategoryIcons
                            icon={note.TypeOfNotesCategory?.icon}
                            size={16}
                            color={complementaryColor}
                            enableFill
                          />
                        );
                      case 'finance':
                        return (
                          <FinanceCategoryIcons
                            icon={note.TypeOfNotesCategory?.icon}
                            size={16}
                            color={complementaryColor}
                            enableFill
                          />
                        );
                      case 'hobby':
                        return (
                          <HobbyCategoryIcons
                            icon={note.TypeOfNotesCategory?.icon}
                            size={16}
                            color={complementaryColor}
                            enableFill
                          />
                        );
                      default:
                        return (
                          <MaterialDesignIcons
                            name='dots-horizontal-circle'
                            size={14}
                            color={complementaryColor}
                          />
                        );
                    }
                  })()}
                </View>
                <Text
                  numberOfLines={1}
                  style={[styles.title, {
                    color: primaryFontColor,
                  }]}>{note.Title}</Text>
              </View>
              <View style={[
                styles.descriptionContainer, {
                  width: width * .488,
                  height: width * .11,
                  marginLeft: width * .0125
                }]}>
                {!!note.Description && (
                  <Text style={[styles.description, {
                    color: primaryFontColor,
                  }]}>{truncatedDescription}
                    <Text style={[styles.seeMore, {
                      color: secondaryFontColor,
                    }]}>
                      {isTruncated(truncatedDescription) === true
                        ? ' See more' : ''
                      }
                    </Text>
                  </Text>
                )}
              </View>
              <View style={[
                styles.footerContainer, {
                  width: width * .488,
                  height: width * .052,
                  marginLeft: width * .0125
                }]}>
                {!!note.Occurrence && (
                  <>
                    <MaterialIcons
                      name='event-repeat'
                      size={14}
                      color={complementaryColor}
                    />
                    <Text style={[styles.date, {
                      color: primaryFontColor,
                    }]}>{note.Occurrence}</Text>
                  </>
                )}
                {!!note.Date && (
                  <>
                    <Ionicons name='calendar' size={14} color={complementaryColor} />
                    <Text style={[styles.date, {
                      color: primaryFontColor,
                    }]}>{formatDate(note.Date)}</Text>
                  </>
                )}
                {!!note.Time && (
                  <>
                    <MaterialDesignIcons
                      name='clock'
                      size={14}
                      color={complementaryColor}
                    />
                    <Text style={[styles.date, {
                      color: primaryFontColor,
                    }]}>{formatTime(note.Time)}</Text>
                  </>
                )}
                {!!note.Days?.length && (
                  <View style={styles.daysContainer}>
                    {formatDays(note.Days).map(day => (
                      <View key={day} style={[styles.daysContent, {
                        backgroundColor: secondaryColor,
                      }]}>
                        <Text style={[styles.dayText, {
                          color: primaryFontColor,
                        }]}>{day}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
            <View style={{ marginRight: width * .02 }}>
              <Fontisto
                name='angle-right'
                color={secondaryColor}
                size={40}
              />
            </View>
            <View style={[styles.noteTypeContainer, {
              backgroundColor: analogousColor,
              width: width * .12,
              height: width * .045,
            }]}>
              {note.TypeOfNote
                ? (<NotesTypeIcons
                  icon={note.TypeOfNote?.icon}
                  size={14}
                  color={complementaryColor}
                  enableFill
                />)
                : (<MaterialIcons
                  name='info'
                  size={14}
                  color={complementaryColor}
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
    borderRadius: 24,
    marginHorizontal: 15,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesCategoryIconContainer: {
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesContentContainer: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 4,
  },
  notesTitleContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  iconTitleContainer: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    marginLeft: 1,
  },
  descriptionContainer: {
    overflow: 'hidden'
  },
  description: {
    fontSize: 12,
    textAlign: 'justify',
  },
  seeMore: {
    fontSize: 12,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  date: {
    marginTop: 2,
    marginLeft: 3,
    marginRight: 5,
    fontSize: 12,
  },
  noteTypeContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    left: '89%',
    bottom: '90%',
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 3,
  },
  daysContent: {
    height: 19,
    width: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 80,
  },
  dayText: {
    fontSize: 8,
  },
  deleteIconContainer: {
    flex: 1,
    position: 'absolute',
    zIndex: -1,
  }
});

export default NoteItemCardView;