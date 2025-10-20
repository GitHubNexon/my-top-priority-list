import { name as appName } from './app.json';
import './src/services/BootRestoreTask';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { enableScreens, enableFreeze } from 'react-native-screens';
import { LogBox } from 'react-native';
// If you have background tasks (like notifications, messaging):
// import './src/services/backgroundHandler';

LogBox.ignoreLogs([
    // React Native Firebase v22 deprecation warnings
    'This method is deprecated (as well as all React Native Firebase namespaced API)',
    'Please see migration guide for more details: https://rnfirebase.io/migrating-to-v22',
]);
enableScreens(true);
enableFreeze(true);
AppRegistry.registerComponent(appName, () => App);