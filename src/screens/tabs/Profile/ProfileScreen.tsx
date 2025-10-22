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
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Feather from '@react-native-vector-icons/feather';
import Fontisto from "@react-native-vector-icons/fontisto";
import Ionicons from '@react-native-vector-icons/ionicons';
import { navigationRef, useProfileNavigation } from "../../../hooks/useNavigation";
import Toast from "../../../components/ToastMessage";
import { ScrollView } from "react-native-gesture-handler";

const ProfileScreen = () => {
  const { width, height } = Dimensions.get('window');
  const { theme } = useTheme();
  const { uid, signOut, isLoggedIn } = useAuth();
  const { getNotesFromFirestore, syncAllData } = useFirestore();
  const { syncNotesFromCloud, clearNotes } = useNotes();
  const navigation = useProfileNavigation();

  const [isSyncing, setIsSyncing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const primaryThemeColor = theme.myColors?.primary;
  const analogousThemColor = theme.myColors?.analogous;
  const triadicThemeColor = theme.myColors?.triadic;
  const complementaryThemeColor = theme.myColors?.complementary;
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

  const handleToggleVibration = async (enabled: boolean) => {
    try {
      setVibrationEnabled(enabled);
    } catch (error) {
      setVibrationEnabled(!enabled); // Revert on error
    }
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
                  color={complementaryThemeColor}
                  size={20}
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={[styles.userInfoContainer, {
            backgroundColor: primaryThemeColor,
            width: width * .93,
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
          <View style={styles.aboutMeContainer}>
            <View style={[styles.topTextContainer, {
              backgroundColor: primaryThemeColor,
              width: width * .93,
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
              <TouchableOpacity
                style={styles.editIconContainer}
              >
                <Feather
                  name='edit'
                  color={analogousThemColor}
                  size={20}
                />
              </TouchableOpacity>
            </View>
            <View style={[styles.midTextContainer, {
              backgroundColor: primaryThemeColor,
              width: width * .93,
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
              width: width * .93,
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
              width: width * .93,
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
          <Text style={[styles.title, {
            marginTop: 38,
          }]}>
            App Settings
          </Text>
          <View style={styles.appSettingsContainer}>
            <TouchableOpacity style={[styles.topTextContainer, {
              backgroundColor: primaryThemeColor,
              width: width * .93,
              height: height * .06,
            }]}>
              <View style={[styles.textContainer, {
                width: width * .7
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Alarm Sound</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Default: App ringtone</Text>
              </View>
              <View style={styles.appSettingsIcon}>
                <Fontisto
                  name='angle-right'
                  color={analogousThemColor}
                  size={20}
                />
              </View>
            </TouchableOpacity>
            <View style={[styles.midTextContainer, {
              backgroundColor: primaryThemeColor,
              width: width * .93,
              height: height * .06,
            }]}>
              <View style={[styles.textContainer, {
                width: width * .7
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Vibrate</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Status: On</Text>
              </View>
              <View style={styles.appSettingsIcon}>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={handleToggleVibration}
                  trackColor={{ false: '#767577', true: analogousThemColor }}
                  thumbColor={vibrationEnabled ? complementaryThemeColor : '#f4f3f4'}
                />
              </View>
            </View>
            <TouchableOpacity style={[styles.midTextContainer, {
              backgroundColor: primaryThemeColor,
              width: width * .93,
              height: height * .06,
            }]}>
              <View style={[styles.textContainer, {
                width: width * .7
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Alarm Timeout</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Duration: 0s - Infinite</Text>
              </View>
              <View
                style={styles.appSettingsIcon}
              >
                <Feather
                  name='edit'
                  color={analogousThemColor}
                  size={20}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bottomTextContainer, {
              backgroundColor: primaryThemeColor,
              width: width * .93,
              height: height * .06,
            }]}>
              <View style={[styles.textContainer, {
                width: width * .7
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Alarm Timeout Action</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Action: Snooze</Text>
              </View>
              <View style={styles.appSettingsIcon}>
                <Fontisto
                  name='angle-right'
                  color={analogousThemColor}
                  size={20}
                />
              </View>
            </TouchableOpacity>
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
    paddingBottom: 48,
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  textContainer: {

  },
  topTextContainer: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 16,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  midTextContainer: {
    marginTop: 2,
    borderRadius: 8,
    padding: 16,
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
    padding: 16,
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
  appSettingsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appSettingsIcon: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center'
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