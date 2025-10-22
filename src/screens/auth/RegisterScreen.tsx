/* eslint-disable react-native/no-inline-styles */
import LoginBG from '../../assets/images/loginBg.png';
import Toast from '../../components/ToastMessage';
import { useAuth } from '../../hooks';
import { navigationRef, useNavigationTyped } from '../../hooks/useNavigation';
import { UserCredentials } from '../../types/UserCredentials';
import Entypo from '@react-native-vector-icons/entypo';
import Ionicons from '@react-native-vector-icons/ionicons';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '../../utils/DateFormatter';

const RegisterScreen = () => {
  const { width, height } = Dimensions.get('window');
  type EntypoIconName = React.ComponentProps<typeof Entypo>['name'];

  const navigation = useNavigationTyped();

  const [eyeIcon, setEyeIcon] = useState<EntypoIconName>('eye-with-line');
  const [textEntry, setTextEntry] = useState(true);
  const [isErrorMessage, setIsErrorMessage] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isLoading, setIsloading] = useState(false)
  const [credentials, setCredentials] = useState<UserCredentials>({
    FullName: null,
    BirthDate: null,
    CreatedAt: null,
  });
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const { signUp } = useAuth();

  const getFullName = (text: string) => {
    setCredentials((prev) => ({
      ...prev,
      FullName: text,
    }))
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowCalendar(false);
    if (event.type === "set" && selectedDate) {
      const iso = selectedDate.toISOString();
      setCredentials((prev) => ({
        ...prev,
        BirthDate: iso,
      }));
    }
    if (event.type === "dismissed") {
      setCredentials((prev) => ({
        ...prev,
        BirthDate: '',
      }));
    }
  };

  const pressedIcon = () => {
    if (eyeIcon === 'eye') {
      setEyeIcon('eye-with-line')
      setTextEntry(true)
    } else {
      setEyeIcon('eye')
      setTextEntry(false)
    }
  };

  // Sign Up Method
  const signUpButton = async () => {
    setIsloading(true)
    try {
      const result = await signUp(email, password, credentials);

      setShowToast(true);
      setToastMessage('Check your email or spam for email verification.');
      return result;
    } catch (error: unknown) {
      setIsErrorMessage(true)
      let errorMessage = "Sign up failed. Please try again.";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setShowToast(true);
      setToastMessage(errorMessage);
      console.error(`Error: ${errorMessage}`);

      throw errorMessage;
    } finally {
      setIsloading(false);
    }
  };

  const handleLoginScreen = () => {
    navigation.replace('Auth', { screen: 'Login' });
  };

  return (
    <ImageBackground style={styles.backgroundImage} source={LoginBG} >
      {!!isLoading &&
        <ActivityIndicator
          size={'large'}
          color={'#2E6F40'}
          style={[styles.loading, {
            right: (width * .5) - 18,
            bottom: height * .5,
          }]}
        />
      }
      <Toast
        message={toastMessage}
        duration={isErrorMessage ? 5000 : 10000}
        visible={showToast}
        onHide={() => {
          setShowToast(false);
          setIsErrorMessage(false);
        }}
        containerStyle={{
          bottom: '90%',
        }}
      />
      <View style={styles.container}>
        <Text style={styles.titleText}>Sign Up</Text>
        <TextInput
          value={credentials.FullName ?? ''}
          onChangeText={text => getFullName(text)}
          placeholderTextColor={'#4b4b4b88'}
          placeholder="Full Name"
          style={[styles.textInput, { marginTop: 70 }]}
        />
        <TextInput
          value={email}
          onChangeText={(text) => setEmail(text)}
          placeholderTextColor={'#4b4b4b88'}
          placeholder="Email"
          style={styles.textInput}
        />
        <Pressable
          onPress={() => setShowCalendar(true)}
          style={[styles.textInput, {
            outlineColor: '#ffffff',
            outlineWidth: 1,
          }]}
        >
          <Ionicons name="calendar-outline" size={30} color="#000000" />
          <Text style={{
            color: '#000000',
            fontSize: 18,
            paddingLeft: 10
          }}>
            {credentials.BirthDate ? formatDate(credentials.BirthDate) : 'Birth Date'}
          </Text>
        </Pressable>
        <View style={styles.passTextInputContainer}>
          <TextInput
            value={password}
            onChangeText={text => setPassword(text)}
            placeholderTextColor={'#4b4b4b88'}
            placeholder="Password"
            secureTextEntry={textEntry}
            style={[
              styles.textInput,
              {
                width: 250,
                marginRight: 0,
                paddingRight: 10,
                borderBottomRightRadius: 0,
                borderTopRightRadius: 0,
                marginTop: 0,
              }
            ]}
          />
          <Pressable style={styles.hideText} onPress={pressedIcon}>
            <Entypo name={eyeIcon} size={30} color="#2E6F40" />
          </Pressable>
        </View>
        <View style={styles.loginButtonView}>
          <Pressable
            onPress={signUpButton}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>
              Sign Up
            </Text>
          </Pressable>
        </View>
        <View>
          <Text style={styles.signUpText}>
            Already have an account?
          </Text>
          <Pressable
            onPress={handleLoginScreen}
          >
            <Text style={[styles.signUpText, { textDecorationLine: 'underline' }]}>
              Log In
            </Text>
          </Pressable>
        </View>
      </View>
      {showCalendar && (
        <RNDateTimePicker
          design='material'
          value={new Date()}
          mode='date'
          display='calendar'
          onChange={handleDateChange}
        />
      )}
    </ImageBackground >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  titleText: {
    fontWeight: '700',
    fontSize: 50,
    textAlign: 'center',
  },
  textInput: {
    width: 320,
    height: 60,
    marginHorizontal: 30,
    marginTop: 10,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderRadius: 30,
    outlineWidth: 2,
    outlineColor: '#e9e9e942',
    backgroundColor: '#ffffff86',
    flexDirection: 'row',
    color: '#000000',
    fontSize: 18,
  },
  passTextInputContainer: {
    flexDirection: 'row',
    marginTop: 15,
    height: 80,
    alignContent: 'center',
    justifyContent: 'center',
  },
  hideText: {
    backgroundColor: '#ffffff86',
    height: 60,
    width: 70,
    borderBottomRightRadius: 30,
    borderTopRightRadius: 30,
    outlineColor: '#e9e9e942',
    outlineWidth: 2,
    marginRight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonView: {
    marginTop: 30,
    marginBottom: 20,
  },
  loginButton: {
    justifyContent: 'center',
    width: 320,
    height: 60,
    marginHorizontal: 30,
    borderRadius: 30,
    outlineWidth: 2,
    outlineColor: '#e9e9e942',
    backgroundColor: '#ffffff86',
  },
  loginText: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 600,
    letterSpacing: 2,
  },
  signUpText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loading: {
    position: 'absolute',
    transform: [{ scale: 3 }],
    zIndex: 1000,
  }
});

export default RegisterScreen;