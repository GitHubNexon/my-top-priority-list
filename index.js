import { name as appName } from './app.json';
import { AppRegistry } from 'react-native';
import App from './src/App';
// If you have background tasks (like notifications, messaging):
// import './src/services/backgroundHandler';

AppRegistry.registerComponent(appName, () => App);