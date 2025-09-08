/* eslint-disable react-native/no-inline-styles */
import LoginBG from '../../assets/images/loginBg.png';
import Toast from '../../components/ToastMessage';
import { useAuth } from '../../hooks';
import { useNavigationTyped } from '../../hooks/useNavigation';
import { Entypo } from '@react-native-vector-icons/entypo';
import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useState } from "react";
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

const LoginScreen = () => {
  const { width, height } = Dimensions.get('window');
  type EntypoIconName = React.ComponentProps<typeof Entypo>['name'];

  const navigation = useNavigationTyped();
  const { signIn, facebookSignIn, googleSignIn } = useAuth();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [eyeIcon, setEyeIcon] = useState<EntypoIconName>('eye-with-line');
  const [textEntry, setTextEntry] = useState(true);

  const pressedIcon = () => {
    if (eyeIcon === 'eye') {
      setEyeIcon('eye-with-line')
      setTextEntry(true)
    } else {
      setEyeIcon('eye')
      setTextEntry(false)
    };
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch (error: unknown) {
      let errorMessage = "Sign in failed. Please check your credentials";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setShowToast(true);
      setToastMessage(errorMessage);

      throw errorMessage
    } finally {
      setIsLoading(false);
    };
  };

  const handleSignInWithGoogle = async () => {
    try {
      googleSignIn();
    } catch (error: unknown) {
      let errorMessage = "Sign in failed. Please try again";

      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw errorMessage;
    }
  };

  const handleRegisterScreen = () => {
    navigation.replace('Auth', { screen: 'Register' });
  };

  return (
    <ImageBackground style={styles.backgroundImage} source={LoginBG} >
      {!!isLoading &&
        <ActivityIndicator
          size={'large'}
          color={'#2E6F40'}
          style={[styles.loading, {
            right: (width * 5) - 18,
            bottom: height * .5,
          }]}
        />
      }
      <Toast
        message={toastMessage}
        visible={showToast}
        onHide={() => setShowToast(false)}
        containerStyle={{
          bottom: '90%',
        }}
      />
      <View style={styles.container}>
        <Text style={styles.titleText}>Log In</Text>
        <TextInput
          value={email}
          onChangeText={(text) => setEmail(text)}
          inputMode='email'
          placeholderTextColor={'#4b4b4b88'}
          placeholder="Username or Email"
          style={[
            styles.textInput,
            {
              borderBottomRightRadius: 30,
              borderTopRightRadius: 30,
              width: 320,
              marginTop: 70,
              paddingRight: 30
            }
          ]}
        />
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
                marginRight: 0,
                paddingRight: 10
              }
            ]}
          />
          <Pressable style={styles.hideText} onPress={pressedIcon}>
            <Entypo name={eyeIcon} size={30} color="#2E6F40" />
          </Pressable>
        </View>
        <View style={styles.loginButtonContainer}>
          <Pressable style={styles.loginButton}>
            <Text
              onPress={handleSignIn}
              style={styles.loginText}
            >
              Log In
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={handleRegisterScreen}
          style={styles.forgetPasswordTextContainer}
        >
          <Text style={styles.forgetPasswordText}>
            Forgot your password?
          </Text>
        </Pressable>
        <View style={styles.loginIconContainer}>
          <Pressable
            onPress={facebookSignIn}
            style={styles.iconButtons}
          >
            <FontAwesome name="facebook-f" size={32} color="black" />
          </Pressable>
          <Pressable
            onPress={handleSignInWithGoogle}
            style={styles.iconButtons}
          >
            <FontAwesome name="google" size={32} color="black" />
          </Pressable>
          <Pressable style={styles.iconButtons} >
            <FontAwesome name="twitter" size={32} color="black" />
          </Pressable>
        </View>
        <View>
          <Text style={styles.signUpText}>
            Don&apos;t have an account?
          </Text>
          <Pressable
            onPress={handleRegisterScreen}
          >
            <Text style={[styles.signUpText, { textDecorationLine: 'underline' }]}>
              Sign Up
            </Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
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
    width: 255,
    height: 60,
    paddingLeft: 30,
    backgroundColor: '#ffffff86',
    marginHorizontal: 30,
    borderBottomLeftRadius: 30,
    borderTopLeftRadius: 30,
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
    width: 65,
    borderBottomRightRadius: 30,
    borderTopRightRadius: 30,
    outlineColor: '#e9e9e942',
    outlineWidth: 2,
    marginRight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonContainer: {
    marginTop: 30,
    marginBottom: 10,
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
  iconButtons: {
    width: 60,
    height: 60,
    borderRadius: 40,
    outlineWidth: 2,
    outlineColor: '#e9e9e942',
    backgroundColor: '#ffffff86',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginIconContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 5,
  },
  forgetPasswordTextContainer: {
    marginBottom: 20
  },
  forgetPasswordText: {
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
    color: '#e4585b',
  },
  signUpText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loading: {
    position: 'absolute',
    transform: [{ scale: 2 }],
    zIndex: 1000
  },
})

export default LoginScreen;