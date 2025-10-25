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
import Ionicons from '@react-native-vector-icons/ionicons';
import { navigationRef, useProfileNavigation } from "../../../hooks/useNavigation";
import Toast from "../../../components/ToastMessage";
import { ScrollView } from "react-native-gesture-handler";
import { BoxWrapper } from "../../../components/Profile/BoxWrapper";
import { TopBoxWrapper } from "../../../components/Profile/TopBoxWrapper";
import { MidBoxWrapper } from "../../../components/Profile/MidBoxWrapper";
import { BottomBoxWrapper } from "../../../components/Profile/BottomBoxWrapper";
import { EditIcon } from "../../../components/Profile/EditIcon";
import { AngleRightIcon } from "../../../components/Profile/AngleRightIcon";

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

  const handleSignIn = () => {
    navigationRef.current?.navigate('Auth', {
      screen: 'Login',
    });
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

  const handleVibration = async () => {
    setVibrationEnabled(prev => !prev);
  };

  return (
    <View style={[styles.container, {
      backgroundColor: triadicThemeColor,
    }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
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
                  size={width * .046}
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
          <BoxWrapper>
            <TopBoxWrapper style={{backgroundColor: primaryThemeColor}}>
              <View style={[styles.textContainer, {
                width: width * .25,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Full Name :</Text>
              </View>
              <Text style={[styles.secondaryText, {
                color: secondaryFontColor,
                height: height * .05,
              }]}>
                John McDonald S. Doe Sr.
              </Text>
              <EditIcon />
            </TopBoxWrapper>
            <MidBoxWrapper style={{backgroundColor: primaryThemeColor}}>
              <View style={[styles.textContainer, {
                width: width * .25,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>B-day :</Text>
              </View>
              <Text style={[styles.secondaryText, {
                color: secondaryFontColor,
                height: height * .05,
              }]}>
                January 2
              </Text>
              <EditIcon />
            </MidBoxWrapper>
            <MidBoxWrapper style={{ backgroundColor: primaryThemeColor }}>
              <View style={[styles.textContainer, {
                width: width * .25,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Gender :</Text>
              </View>
              <Text style={[styles.secondaryText, {
                color: secondaryFontColor,
                height: height * .05,
              }]}>
                Prefer not to say
              </Text>
              <EditIcon />
            </MidBoxWrapper>
            <BottomBoxWrapper style={{ backgroundColor: primaryThemeColor }}>
              <View style={[styles.textContainer, {
                width: width * .25,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Age :</Text>
              </View>
              <Text style={[styles.secondaryText, {
                color: secondaryFontColor,
                height: height * .05,
              }]}>
                21 - 30
              </Text>
              <EditIcon />
            </BottomBoxWrapper>
          </BoxWrapper>
          <Text style={[styles.title, {
            marginTop: 38,
          }]}>
            App Settings
          </Text>
          <BoxWrapper>
            <TopBoxWrapper style={{
              backgroundColor: primaryThemeColor
            }}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Alarm Sound</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Default: App ringtone</Text>
              </View>
              <AngleRightIcon />
            </TopBoxWrapper>
            <MidBoxWrapper
              onPress={handleVibration}
              style={{ backgroundColor: primaryThemeColor }}
            >
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Vibrate</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Status: On</Text>
              </View>
              <View style={[styles.appSettingsIcon, {
                height: height * .05,
              }]}>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={handleToggleVibration}
                  trackColor={{ false: '#767577', true: analogousThemColor }}
                  thumbColor={vibrationEnabled ? complementaryThemeColor : '#f4f3f4'}
                  style={{
                    width: width * .1,
                    height: height * .05,
                  }}
                />
              </View>
            </MidBoxWrapper>
            <MidBoxWrapper style={{backgroundColor: primaryThemeColor}}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Alarm Timeout</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Duration: 0s - Infinite</Text>
              </View>
              <EditIcon />
            </MidBoxWrapper>
            <MidBoxWrapper style={{ backgroundColor: primaryThemeColor }}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Alarm Timeout Action</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Action: Snooze</Text>
              </View>
              <AngleRightIcon />
            </MidBoxWrapper>
            <BottomBoxWrapper style={{backgroundColor: primaryThemeColor}}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Theme</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Default: System</Text>
              </View>
              <AngleRightIcon />
            </BottomBoxWrapper>
          </BoxWrapper>
          <Text style={[styles.title, {
            marginTop: 38,
          }]}>
            Account Settings
          </Text>
          <BoxWrapper>
            <TopBoxWrapper
              onPress={syncMyData}
              style={{ backgroundColor: primaryThemeColor }}
            >
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Sync Data</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Sync your local data from the cloud.</Text>
              </View>
              <AngleRightIcon />
            </TopBoxWrapper>
            <MidBoxWrapper style={{ backgroundColor: primaryThemeColor }}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Enable MFA</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Multi-factor Authentication Code : Off</Text>
              </View>
              <EditIcon />
            </MidBoxWrapper>
            <MidBoxWrapper style={{ backgroundColor: primaryThemeColor }}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Change Email</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>johnDoe.xzy1234@gmail.com</Text>
              </View>
              <EditIcon />
            </MidBoxWrapper>
            <MidBoxWrapper style={{ backgroundColor: primaryThemeColor }}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Change Password</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>* * * * * * * *</Text>
              </View>
              <EditIcon />
            </MidBoxWrapper>
            <BottomBoxWrapper style={{ backgroundColor: primaryThemeColor }}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Delete Account</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Request account deletion takes time.</Text>
              </View>
              <AngleRightIcon />
            </BottomBoxWrapper>
          </BoxWrapper>
          <Text style={[styles.title, {
            marginTop: 38,
          }]}>
            App Information
          </Text>
          <BoxWrapper>
            <TopBoxWrapper style={{ backgroundColor: primaryThemeColor }}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>About App</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>App Features and Tutorials</Text>
              </View>
              <AngleRightIcon />
            </TopBoxWrapper>
            <MidBoxWrapper style={{ backgroundColor: primaryThemeColor }}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Version</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Beta : v1.0.0</Text>
              </View>
              <AngleRightIcon />
            </MidBoxWrapper>
            <MidBoxWrapper style={{ backgroundColor: primaryThemeColor }}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Developer Info</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>@findingshrek</Text>
              </View>
              <AngleRightIcon />
            </MidBoxWrapper>
            <MidBoxWrapper style={{ backgroundColor: primaryThemeColor }}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Privacy and Policy</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>App privacy and policy</Text>
              </View>
              <AngleRightIcon />
            </MidBoxWrapper>
            <BottomBoxWrapper style={{ backgroundColor: primaryThemeColor }}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Term of Service</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Please read carefully</Text>
              </View>
              <AngleRightIcon />
            </BottomBoxWrapper>
          </BoxWrapper>
          <Text style={[styles.title, {
            marginTop: 38,
          }]}>
            Customer Support
          </Text>
          <BoxWrapper>
            <TopBoxWrapper
              onPress={faqHandle}
              style={{ backgroundColor: primaryThemeColor }}
            >
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>FaQ</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Frequently Asks Question</Text>
              </View>
              <AngleRightIcon />
            </TopBoxWrapper>
            <BottomBoxWrapper style={{ backgroundColor: primaryThemeColor }}>
              <View style={[styles.textContainer, {
                width: width * .7,
                height: height * .05,
              }]}>
                <Text style={[styles.primaryText, {
                  color: primaryFontColor,
                }]}>Report a Problem</Text>
                <Text style={[styles.secondaryText, {
                  fontSize: 12,
                  color: secondaryFontColor,
                }]}>Report Bugs or Suggestion and Improvement</Text>
              </View>
              <EditIcon />
            </BottomBoxWrapper>
          </BoxWrapper>
          <TouchableOpacity
            onPress={isLoggedIn ? handleSignOut : handleSignIn}
            style={[styles.signOutButton, {
              backgroundColor: isLoggedIn ? '#D66767' : '#68BA7F',
              width: width * .4,
              height: height * .05
            }]}
          >
            <Text style={styles.signOutText}>
              {isLoggedIn ? 'Sign Out' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 40,
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
  textContainer: {
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  primaryText: {
    fontSize: 16,
    fontWeight: 500,
  },
  secondaryText: {
    fontSize: 16,
    width: 'auto',
    textAlignVertical: 'center'
  },
  appSettingsIcon: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  signOutButton: {
    flexDirection: 'row',
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    borderRadius: 40,
  },
  signOutText: {
    textAlign: 'center',
    fontSize: 20,
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