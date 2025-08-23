import { name as appName } from './app.json';
import { AppRegistry } from 'react-native';
import App from './src/App';
import { enableScreens } from 'react-native-screens';
// If you have background tasks (like notifications, messaging):
// import './src/services/backgroundHandler';
enableScreens(true);
AppRegistry.registerComponent(appName, () => App);