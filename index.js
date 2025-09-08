import { name as appName } from './app.json';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { enableScreens, enableFreeze } from 'react-native-screens';
// If you have background tasks (like notifications, messaging):
// import './src/services/backgroundHandler';
enableScreens(true);
enableFreeze(true);
AppRegistry.registerComponent(appName, () => App);