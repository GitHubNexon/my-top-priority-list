/* eslint-disable react-native/no-inline-styles */
import {
  useAuth,
  useFirestore,
  useNotes,
  useTheme,
} from "../../../hooks";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from '@react-native-vector-icons/ionicons';
import { useProfileNavigation } from "../../../hooks/useNavigation";
import Toast from "../../../components/ToastMessage";
import { ScrollView } from "react-native-gesture-handler";

const ProfileScreen = () => {
  const { width, height } = Dimensions.get('window');
  const { theme } = useTheme();
  const { uid, signOut } = useAuth();
  const { getNotesFromFirestore, syncAllData } = useFirestore();
  const { syncNotesFromCloud, clearNotes } = useNotes();
  const navigation = useProfileNavigation();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triadicThemeColor = theme.myColors?.triadic;
  const primaryThemeColor = theme.myColors?.primary;
  const complementaryColor = theme.myColors?.complementary;
  const primaryFontColor = theme.fontColors?.primary;
  const secondaryFontColor = theme.fontColors?.secondary;

  const profileView = false;
  const profileImage = require('../../../assets/images/catMeme.jpg');

  const syncMyData = async () => {
    setIsSyncing(true);
    try {
      // First sync local changes to Firestore
      if (!uid) {
        setShowToast(true);
        setToastMessage('Error: You need to sign in first.');
        return;
      }
      await syncAllData(uid);

      // Then get the latest from Firestore
      const cloudNotes = await getNotesFromFirestore();

      // Finally update local storage with merged data
      syncNotesFromCloud(cloudNotes);
    } catch (error: unknown) {
      let errorMessage = "Synching failed, check your internet connection.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setShowToast(true);
      setToastMessage(errorMessage);

      throw errorMessage
    } finally {
      setIsSyncing(false);
    };
  };


  const handleSignOut = async () => {
    setIsSyncing(true);
    try {
      /**
       * Execute both operations sequentially
       * 1. Clear notes first
       * 2. Clear storage keys of failed CRUD operation
       * from being offline
       */
      clearNotes();

      // 2. Then handle auth signout
      await signOut();
    } catch (error) {
      Alert.alert(`Logout error: ${error}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const faqHandle = () => {
    navigation.push("FaQScreen");
  };

  return (
    <View style={[styles.container, {
      backgroundColor: triadicThemeColor,
    }]}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        <View style={styles.scrollViewContainer}>
          <View style={[styles.accountImageContainer, {
            width: width * .24,
            height: width * .24,
            backgroundColor: triadicThemeColor,
          }]}>
            <TouchableOpacity style={styles.imageButton}>
              <Image
                style={[styles.accountImage, {
                  height: width * .22,
                  width: width * .22,
                }]}
                source={profileImage}
              />
              <View style={[styles.cameraIconContainer, {
                backgroundColor: triadicThemeColor,
                borderRadius: 200,
                height: width * .06,
                width: width * .06,
              }]}>
                <Ionicons
                  name="camera"
                  color={complementaryColor}
                  size={20}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={[styles.userInfoContainer, {
            backgroundColor: primaryThemeColor,
            width: width * .9,
            height: height * .2
          }]}>
            <Text style={[styles.userFullName, {
              color: primaryFontColor,
            }]}>
              John Doe
            </Text>
            <Text style={[styles.userEmail, {
              color: secondaryFontColor,
            }]}>
              johnDoe.xzy1234@gmail.com
            </Text>
            <Text style={[styles.since, {
              color: primaryFontColor,
            }]}>
              Member Since :
              <Text style={[styles.date, {
                color: secondaryFontColor,
              }]}>
                {' '}Jan 21, 2025
              </Text>
            </Text>
          </View>
          <Text style={styles.title}>
            About Me
          </Text>
          <View style={[styles.aboutMeContainer, {
            width: width * .9,
            height: height * .15
          }]}>
            <View style={styles.aboutMeContent}>
              <View style={[styles.topTextContainer, {
                backgroundColor: primaryThemeColor,
                width: width * .9,
                height: height * .06,
              }]}>
                <View style={[styles.textContainer, {
                  width: width * .2
                }]}>
                  <Text style={[styles.primaryText, {
                    color: primaryFontColor,
                  }]}>Full Name :</Text>
                </View>
                <Text style={[styles.secondaryText, {
                  color: secondaryFontColor,
                }]}>
                  John McDonald S. Doe Sr.
                </Text>
              </View>
              <View style={[styles.midTextContainer, {
                backgroundColor: primaryThemeColor,
                width: width * .9,
                height: height * .06,
              }]}>
                <View style={[styles.textContainer, {
                  width: width * .2
                }]}>
                  <Text style={[styles.primaryText, {
                    color: primaryFontColor,
                  }]}>B-day :</Text>
                </View>
                <Text style={[styles.secondaryText, {
                  color: secondaryFontColor,
                }]}>
                  January 2
                </Text>
              </View>
              <View style={[styles.midTextContainer, {
                backgroundColor: primaryThemeColor,
                width: width * .9,
                height: height * .06,
              }]}>
                <View style={[styles.textContainer, {
                  width: width * .2
                }]}>
                  <Text style={[styles.primaryText, {
                    color: primaryFontColor,
                  }]}>Gender :</Text>
                </View>
                <Text style={[styles.secondaryText, {
                  color: secondaryFontColor,
                }]}>
                  Prefer not to say
                </Text>
              </View>
              <View style={[styles.bottomTextContainer, {
                backgroundColor: primaryThemeColor,
                width: width * .9,
                height: height * .06,
              }]}>
                <View style={[styles.textContainer, {
                  width: width * .2
                }]}>
                  <Text style={[styles.primaryText, {
                    color: primaryFontColor,
                  }]}>Age :</Text>
                </View>
                <Text style={[styles.secondaryText, {
                  color: secondaryFontColor,
                }]}>
                  21 - 30
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {!!profileView && <View>
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
        />
        <Text style={[styles.primaryText, {
          color: primaryFontColor,
        }]}>My Profile</Text>

        <Pressable
          onPress={faqHandle}
          style={styles.loginButton}
        >
          <Text style={styles.loginText}>
            FaQ
          </Text>
        </Pressable>

        <Pressable
          onPress={syncMyData}
          style={styles.loginButton}
        >
          <Text style={styles.loginText}>
            Sync Data
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSignOut}
          style={styles.loginButton}
        >
          <Text style={styles.loginText}>
            Log Out
          </Text>
        </Pressable>
      </View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#68BA7F',
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  accountImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
    position: 'absolute',
    zIndex: 1000,
    top: '.25%',
  },
  imageButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 200,
  },
  accountImage: {
    borderRadius: 200,
  },
  cameraIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 5000,
    alignSelf: 'flex-end',
    bottom: 1,
    marginRight: 6,
  },
  userInfoContainer: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '12%',
  },
  userFullName: {
    paddingTop: '12%',
    fontSize: 24,
    fontWeight: 600,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: 400,
  },
  since: {
    paddingTop: '4%',
    fontSize: 20,
    fontWeight: 400,
  },
  date: {
    fontSize: 20,
  },
  aboutMeContainer: {
    marginTop: 56,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aboutMeContent: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {

  },
  topTextContainer: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    paddingLeft: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  midTextContainer: {
    marginTop: 2,
    borderRadius: 8,
    paddingLeft: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bottomTextContainer: {
    marginTop: 2,
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    paddingLeft: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  primaryText: {
    fontSize: 16,
    fontWeight: 500,
  },
  secondaryText: {
    fontSize: 16,
  },
  loginButton: {
    justifyContent: 'center',
    width: 320,
    height: 60,
    marginBottom: 50,
    paddingHorizontal: 30,
    borderRadius: 30,
    outlineWidth: 2,
    outlineColor: '#e9e9e942',
    backgroundColor: '#68BA7F',
  },
  loginText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: 2,
  },
  loading: {
    position: 'absolute',
    transform: [{ scale: 2 }],
    zIndex: 1000
  },
});

export default ProfileScreen;