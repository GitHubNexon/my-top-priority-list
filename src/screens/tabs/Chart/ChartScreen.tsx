import WIP from '../../../assets/images/undraw_analytics_6mru.svg';
import React from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useTheme } from '../../../hooks';

const ChartScreen = () => {
  const { theme } = useTheme();
  const themeColor = theme.colors.background;

  return (
    <View style={[styles.container, {
      backgroundColor: themeColor,
    }]}>
      <WIP
        width='100%'
        height='100%'
        style={styles.backgroundImage}
      />
      <Text style={styles.text}>
        W.I.P
      </Text>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 80,
    fontWeight: 600,
  },
  box: {
    height: 60,
    width: 60,
    backgroundColor: '#fff'
  },
  backgroundImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  }
});

export default ChartScreen;